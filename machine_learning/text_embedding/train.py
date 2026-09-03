import argparse
import json
import math
import random
from collections import Counter
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from dataset import (
    ContrastiveJobBatchSampler,
    JobGroupedBatchSampler,
    JobMatchCollator,
    JobMatchDataset,
)
from datasets import load_dataset
from model.job_match import JobMatchModel
from torch.utils.data import DataLoader
from transformers import AutoConfig, AutoTokenizer, get_linear_schedule_with_warmup

from config import (
    DEFAULT_DATASET,
    DEFAULT_MAX_LENGTH,
    EMBEDDING_DIM,
    LABEL_SCORES,
    MODEL_NAME,
)


def positive_int(value):
    value = int(value)
    if value < 1:
        raise argparse.ArgumentTypeError("must be at least 1")
    return value


def parse_args():
    parser = argparse.ArgumentParser(description="Train the resume/job dual encoder")
    parser.add_argument("--dataset", default=DEFAULT_DATASET)
    parser.add_argument("--model-name", default=MODEL_NAME)
    parser.add_argument("--output-dir", default="checkpoints/retrained")
    parser.add_argument("--max-length", type=int, default=DEFAULT_MAX_LENGTH)
    parser.add_argument("--batch-size", type=positive_int, default=2)
    parser.add_argument("--gradient-accumulation", type=positive_int, default=4)
    parser.add_argument("--contrastive-epochs", type=positive_int, default=1)
    parser.add_argument("--contrastive-batch-size", type=positive_int, default=2)
    parser.add_argument("--contrastive-learning-rate", type=float, default=2e-5)
    parser.add_argument("--contrastive-temperature", type=float, default=0.07)
    parser.add_argument("--hard-negatives-per-positive", type=positive_int, default=2)
    parser.add_argument("--epochs", type=positive_int, default=5)
    parser.add_argument("--learning-rate", type=float, default=2e-5)
    parser.add_argument("--weight-decay", type=float, default=0.01)
    parser.add_argument("--warmup-ratio", type=float, default=0.1)
    parser.add_argument("--validation-ratio", type=float, default=0.1)
    parser.add_argument(
        "--validation-group",
        choices=("resume", "jd"),
        default="resume",
        help="Hold out complete candidates (default) or complete jobs",
    )
    parser.add_argument("--ranking-weight", type=float, default=0.25)
    parser.add_argument("--ranking-margin", type=float, default=0.10)
    parser.add_argument(
        "--selection-metric",
        choices=("ndcg_at_10", "mse"),
        default="ndcg_at_10",
        help="Metric used for best-checkpoint selection and early stopping",
    )
    parser.add_argument("--patience", type=int, default=2)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--num-workers", type=int, default=0)
    parser.add_argument("--no-amp", action="store_true")
    parser.add_argument("--no-gradient-checkpointing", action="store_true")
    parser.add_argument("--resume-from")
    return parser.parse_args()


def set_seed(seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def normalize_columns(data):
    aliases = {
        "resume_text": "resume",
        "job_description_text": "jd",
        "job_description": "jd",
        "fit": "label",
    }
    for old, new in aliases.items():
        if old in data.column_names and new not in data.column_names:
            data = data.rename_column(old, new)
    missing = {"resume", "jd", "label"} - set(data.column_names)
    if missing:
        raise ValueError(f"Dataset is missing required columns: {sorted(missing)}")
    optional = [
        column
        for column in ("resume_domain", "jd_domain", "source")
        if column in data.column_names
    ]
    return data.select_columns(["resume", "jd", "label", *optional])


def grouped_split(data, validation_ratio, seed, group_column="resume"):
    if not 0 < validation_ratio < 1:
        raise ValueError("validation_ratio must be between 0 and 1")
    if group_column not in {"resume", "jd"}:
        raise ValueError("group_column must be 'resume' or 'jd'")
    groups = sorted(set(data[group_column]))
    rng = random.Random(seed)
    rng.shuffle(groups)
    validation_count = max(1, round(len(groups) * validation_ratio))
    validation_groups = set(groups[:validation_count])
    train_indices = []
    validation_indices = []
    for index, group in enumerate(data[group_column]):
        target = validation_indices if group in validation_groups else train_indices
        target.append(index)
    return data.select(train_indices), data.select(validation_indices)


def document_overlap(left, right):
    return {
        "resume": len(set(left["resume"]) & set(right["resume"])),
        "jd": len(set(left["jd"]) & set(right["jd"])),
    }


def class_weights(labels):
    counts = Counter(labels)
    missing = set(LABEL_SCORES) - set(counts)
    if missing:
        raise ValueError(f"Training data is missing labels: {sorted(missing)}")
    total = sum(counts.values())
    classes = len(counts)
    return {label: total / (classes * count) for label, count in counts.items()}


def matching_loss(
    scores,
    targets,
    sample_weights,
    job_group_ids,
    ranking_weight=0.25,
    ranking_margin=0.10,
):
    regression = F.smooth_l1_loss(scores, targets, reduction="none")
    regression = (regression * sample_weights).sum() / sample_weights.sum().clamp_min(1e-9)

    target_difference = targets[:, None] - targets[None, :]
    same_job = job_group_ids[:, None] == job_group_ids[None, :]
    ordered_pairs = same_job & (target_difference > 0)
    if ordered_pairs.any():
        score_difference = scores[:, None] - scores[None, :]
        required_margin = ranking_margin * (target_difference / 0.5)
        ranking = F.relu(required_margin - score_difference)[ordered_pairs].mean()
    else:
        ranking = scores.new_zeros(())
    return regression + ranking_weight * ranking, regression, ranking


def supervised_contrastive_loss(scores, targets, job_group_ids, temperature=0.07):
    if temperature <= 0:
        raise ValueError("contrastive temperature must be positive")
    losses = []
    for group_id in torch.unique(job_group_ids):
        group_mask = job_group_ids == group_id
        positive_mask = group_mask & (targets == LABEL_SCORES["Good Fit"])
        negative_mask = group_mask & (targets == LABEL_SCORES["No Fit"])
        if not positive_mask.any() or not negative_mask.any():
            continue
        positive_logits = scores[positive_mask] / temperature
        candidate_logits = scores[positive_mask | negative_mask] / temperature
        losses.append(
            torch.logsumexp(candidate_logits, dim=0)
            - torch.logsumexp(positive_logits, dim=0)
        )
    if not losses:
        return scores.sum() * 0.0
    return torch.stack(losses).mean()


def hard_negative_mask(data):
    if not {"resume_domain", "jd_domain"}.issubset(data.column_names):
        return [False] * len(data)
    return [
        label == "No Fit" and resume_domain == jd_domain
        for label, resume_domain, jd_domain in zip(
            data["label"], data["resume_domain"], data["jd_domain"]
        )
    ]


def prediction_metrics(scores, targets, job_group_ids):
    scores = np.asarray(scores, dtype=np.float64)
    targets = np.asarray(targets, dtype=np.float64)
    predicted_classes = np.digitize(scores, bins=[0.25, 0.75])
    target_classes = np.digitize(targets, bins=[0.25, 0.75])
    metrics = {
        "mse": float(np.mean((scores - targets) ** 2)),
        "mae": float(np.mean(np.abs(scores - targets))),
        "accuracy": float(np.mean(predicted_classes == target_classes)),
    }

    grouped = {}
    for score, target, group_id in zip(scores, targets, job_group_ids):
        grouped.setdefault(group_id, []).append((score, target))
    ndcg_values = []
    for pairs in grouped.values():
        ranked_relevance = [
            target
            for _, target in sorted(
                pairs, key=lambda pair: pair[0], reverse=True
            )[:10]
        ]
        ideal_relevance = sorted((target for _, target in pairs), reverse=True)[:10]
        discounts = np.log2(np.arange(2, len(ranked_relevance) + 2))
        dcg = np.sum((np.power(2.0, ranked_relevance) - 1.0) / discounts)
        ideal_dcg = np.sum((np.power(2.0, ideal_relevance) - 1.0) / discounts)
        if ideal_dcg > 0:
            ndcg_values.append(float(dcg / ideal_dcg))
    metrics["ndcg_at_10"] = float(np.mean(ndcg_values)) if ndcg_values else 0.0
    return metrics


def move_batch(batch, device):
    return {key: value.to(device) for key, value in batch.items()}


def run_epoch(
    model,
    loader,
    device,
    ranking_weight,
    ranking_margin,
    optimizer=None,
    scheduler=None,
    scaler=None,
    accumulation_steps=1,
    use_amp=False,
    objective="matching",
    contrastive_temperature=0.07,
):
    training = optimizer is not None
    model.train(training)
    if training:
        optimizer.zero_grad(set_to_none=True)

    totals = {
        "loss": 0.0,
        "contrastive_loss": 0.0,
        "regression_loss": 0.0,
        "ranking_loss": 0.0,
    }
    all_scores = []
    all_targets = []
    all_job_group_ids = []

    for step, batch in enumerate(loader):
        batch = move_batch(batch, device)
        grad_context = torch.enable_grad() if training else torch.no_grad()
        with grad_context:
            with torch.amp.autocast(device_type=device.type, enabled=use_amp):
                scores = model(
                    batch["resume_input_ids"],
                    batch["resume_attention"],
                    batch["job_input_ids"],
                    batch["job_attention"],
                )
                if objective == "contrastive":
                    contrastive = supervised_contrastive_loss(
                        scores,
                        batch["label"],
                        batch["job_group_id"],
                        contrastive_temperature,
                    )
                    loss = contrastive
                    regression = scores.new_zeros(())
                    ranking = scores.new_zeros(())
                elif objective == "matching":
                    loss, regression, ranking = matching_loss(
                        scores,
                        batch["label"],
                        batch["sample_weight"],
                        batch["job_group_id"],
                        ranking_weight,
                        ranking_margin,
                    )
                    contrastive = scores.new_zeros(())
                else:
                    raise ValueError(f"Unknown training objective: {objective!r}")

            if training:
                scaled_loss = loss / accumulation_steps
                scaler.scale(scaled_loss).backward()
                should_step = (step + 1) % accumulation_steps == 0 or step + 1 == len(loader)
                if should_step:
                    scaler.unscale_(optimizer)
                    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                    scaler.step(optimizer)
                    scaler.update()
                    optimizer.zero_grad(set_to_none=True)
                    if scheduler is not None:
                        scheduler.step()

        batch_size = batch["label"].shape[0]
        totals["loss"] += loss.item() * batch_size
        totals["contrastive_loss"] += contrastive.item() * batch_size
        totals["regression_loss"] += regression.item() * batch_size
        totals["ranking_loss"] += ranking.item() * batch_size
        all_scores.extend(scores.detach().float().cpu().tolist())
        all_targets.extend(batch["label"].detach().float().cpu().tolist())
        all_job_group_ids.extend(batch["job_group_id"].detach().cpu().tolist())

        if training and (step + 1) % 50 == 0:
            print(f"  batch {step + 1}/{len(loader)} loss={loss.item():.4f}", flush=True)

    example_count = len(all_targets)
    metrics = {key: value / example_count for key, value in totals.items()}
    metrics.update(prediction_metrics(all_scores, all_targets, all_job_group_ids))
    return metrics


def save_checkpoint(
    path,
    model,
    epoch,
    metrics,
    config,
    optimizer=None,
    scheduler=None,
):
    path.parent.mkdir(parents=True, exist_ok=True)
    checkpoint = {
        "format_version": 2,
        "model_state_dict": model.state_dict(),
        "epoch": epoch,
        "metrics": metrics,
        "config": config,
    }
    if optimizer is not None:
        checkpoint["optimizer_state_dict"] = optimizer.state_dict()
    if scheduler is not None:
        checkpoint["scheduler_state_dict"] = scheduler.state_dict()
    torch.save(checkpoint, path)


def optimizer_and_scheduler(model, loader, epochs, learning_rate, args):
    if len(loader) == 0:
        raise ValueError("No usable batches were created for this training stage")
    optimizer = torch.optim.AdamW(
        model.parameters(), lr=learning_rate, weight_decay=args.weight_decay
    )
    optimizer_steps_per_epoch = math.ceil(len(loader) / args.gradient_accumulation)
    total_steps = max(1, optimizer_steps_per_epoch * epochs)
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=round(total_steps * args.warmup_ratio),
        num_training_steps=total_steps,
    )
    return optimizer, scheduler


def main():
    args = parse_args()
    set_seed(args.seed)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    use_amp = device.type == "cuda" and not args.no_amp
    print(f"device={device} amp={use_amp}")

    raw = load_dataset(args.dataset)
    full_train = normalize_columns(raw["train"])
    train_data, validation_data = grouped_split(
        full_train,
        args.validation_ratio,
        args.seed,
        group_column=args.validation_group,
    )
    test_data = normalize_columns(raw["test"]) if "test" in raw else None
    weights = class_weights(train_data["label"])
    print(
        f"rows train={len(train_data)} validation={len(validation_data)} "
        f"test={len(test_data) if test_data is not None else 0}"
    )
    print(f"class weights={weights}")
    print(f"train/validation document overlap={document_overlap(train_data, validation_data)}")
    if test_data is not None:
        test_overlap = document_overlap(full_train, test_data)
        print(f"train/test document overlap={test_overlap}")
        if test_overlap[args.validation_group] > 0:
            print(
                "warning: skipping the published test split because it overlaps "
                f"training on {args.validation_group!r}; use the clean validation metrics"
            )
            test_data = None

    tokenizer = AutoTokenizer.from_pretrained(args.model_name)
    backbone_config = AutoConfig.from_pretrained(args.model_name)
    attention_window = getattr(backbone_config, "attention_window", None)
    if isinstance(attention_window, (list, tuple)):
        attention_window = attention_window[0]
    collator = JobMatchCollator(
        tokenizer, pad_to_multiple_of=attention_window or 8
    )
    train_dataset = JobMatchDataset(train_data, tokenizer, args.max_length, weights)
    validation_dataset = JobMatchDataset(
        validation_data, tokenizer, args.max_length, weights
    )
    train_sampler = JobGroupedBatchSampler(
        train_dataset.job_group_ids,
        args.batch_size,
        labels=train_data["label"],
        seed=args.seed,
    )
    train_loader = DataLoader(
        train_dataset,
        batch_sampler=train_sampler,
        collate_fn=collator,
        num_workers=args.num_workers,
        pin_memory=device.type == "cuda",
    )
    validation_sampler = JobGroupedBatchSampler(
        validation_dataset.job_group_ids,
        args.batch_size,
        labels=validation_data["label"],
        shuffle=False,
    )
    validation_loader = DataLoader(
        validation_dataset,
        batch_sampler=validation_sampler,
        collate_fn=collator,
        num_workers=args.num_workers,
        pin_memory=device.type == "cuda",
    )

    train_hard_negatives = hard_negative_mask(train_data)
    validation_hard_negatives = hard_negative_mask(validation_data)
    contrastive_train_sampler = ContrastiveJobBatchSampler(
        train_dataset.job_group_ids,
        train_data["label"],
        args.contrastive_batch_size,
        hard_negative_mask=train_hard_negatives,
        negatives_per_positive=args.hard_negatives_per_positive,
        seed=args.seed,
    )
    contrastive_validation_sampler = ContrastiveJobBatchSampler(
        validation_dataset.job_group_ids,
        validation_data["label"],
        args.contrastive_batch_size,
        hard_negative_mask=validation_hard_negatives,
        negatives_per_positive=args.hard_negatives_per_positive,
        shuffle=False,
    )
    contrastive_train_loader = DataLoader(
        train_dataset,
        batch_sampler=contrastive_train_sampler,
        collate_fn=collator,
        num_workers=args.num_workers,
        pin_memory=device.type == "cuda",
    )
    contrastive_validation_loader = DataLoader(
        validation_dataset,
        batch_sampler=contrastive_validation_sampler,
        collate_fn=collator,
        num_workers=args.num_workers,
        pin_memory=device.type == "cuda",
    )
    print(
        f"hard negatives train={sum(train_hard_negatives)} "
        f"validation={sum(validation_hard_negatives)}"
    )

    model = JobMatchModel(
        model_name=args.model_name,
        embedding_dim=EMBEDDING_DIM,
        gradient_checkpointing=not args.no_gradient_checkpointing,
    ).to(device)
    scaler = torch.amp.GradScaler(device.type, enabled=use_amp)

    run_config = {
        "dataset": args.dataset,
        "model_name": args.model_name,
        "max_length": args.max_length,
        "embedding_dim": EMBEDDING_DIM,
        "label_scores": LABEL_SCORES,
        "validation_group": args.validation_group,
        "contrastive_epochs": args.contrastive_epochs,
        "contrastive_batch_size": args.contrastive_batch_size,
        "contrastive_learning_rate": args.contrastive_learning_rate,
        "contrastive_temperature": args.contrastive_temperature,
        "hard_negatives_per_positive": args.hard_negatives_per_positive,
        "matching_epochs": args.epochs,
        "matching_learning_rate": args.learning_rate,
        "ranking_weight": args.ranking_weight,
        "ranking_margin": args.ranking_margin,
    }
    (output_dir / "training_config.json").write_text(
        json.dumps(run_config, indent=2), encoding="utf-8"
    )
    tokenizer.save_pretrained(output_dir / "tokenizer")

    history = []
    if not args.resume_from:
        contrastive_optimizer, contrastive_scheduler = optimizer_and_scheduler(
            model,
            contrastive_train_loader,
            args.contrastive_epochs,
            args.contrastive_learning_rate,
            args,
        )
        for epoch in range(args.contrastive_epochs):
            print(f"contrastive epoch {epoch + 1}/{args.contrastive_epochs}")
            contrastive_train_sampler.set_epoch(epoch)
            train_metrics = run_epoch(
                model,
                contrastive_train_loader,
                device,
                args.ranking_weight,
                args.ranking_margin,
                optimizer=contrastive_optimizer,
                scheduler=contrastive_scheduler,
                scaler=scaler,
                accumulation_steps=args.gradient_accumulation,
                use_amp=use_amp,
                objective="contrastive",
                contrastive_temperature=args.contrastive_temperature,
            )
            validation_metrics = run_epoch(
                model,
                contrastive_validation_loader,
                device,
                args.ranking_weight,
                args.ranking_margin,
                use_amp=use_amp,
                objective="contrastive",
                contrastive_temperature=args.contrastive_temperature,
            )
            epoch_metrics = {
                "stage": "contrastive",
                "epoch": epoch,
                "train": train_metrics,
                "validation": validation_metrics,
            }
            history.append(epoch_metrics)
            print(json.dumps(epoch_metrics, indent=2))
    optimizer, scheduler = optimizer_and_scheduler(
        model, train_loader, args.epochs, args.learning_rate, args
    )
    start_epoch = 0
    if args.resume_from:
        checkpoint = torch.load(args.resume_from, map_location=device, weights_only=True)
        model.load_state_dict(checkpoint["model_state_dict"])
        optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
        scheduler.load_state_dict(checkpoint["scheduler_state_dict"])
        start_epoch = checkpoint["epoch"] + 1

    best_selection_value = None
    epochs_without_improvement = 0
    for epoch in range(start_epoch, args.epochs):
        print(f"matching epoch {epoch + 1}/{args.epochs}")
        train_sampler.set_epoch(epoch)
        train_metrics = run_epoch(
            model,
            train_loader,
            device,
            args.ranking_weight,
            args.ranking_margin,
            optimizer=optimizer,
            scheduler=scheduler,
            scaler=scaler,
            accumulation_steps=args.gradient_accumulation,
            use_amp=use_amp,
        )
        validation_metrics = run_epoch(
            model,
            validation_loader,
            device,
            args.ranking_weight,
            args.ranking_margin,
            use_amp=use_amp,
        )
        epoch_metrics = {
            "stage": "matching",
            "epoch": epoch,
            "train": train_metrics,
            "validation": validation_metrics,
        }
        history.append(epoch_metrics)
        print(json.dumps(epoch_metrics, indent=2))
        save_checkpoint(
            output_dir / "last.pt",
            model,
            epoch,
            epoch_metrics,
            run_config,
            optimizer,
            scheduler,
        )

        selection_value = validation_metrics[args.selection_metric]
        improved = (
            best_selection_value is None
            or args.selection_metric == "mse"
            and selection_value < best_selection_value
            or args.selection_metric == "ndcg_at_10"
            and selection_value > best_selection_value
        )
        if improved:
            best_selection_value = selection_value
            epochs_without_improvement = 0
            save_checkpoint(
                output_dir / "best.pt",
                model,
                epoch,
                epoch_metrics,
                run_config,
            )
        else:
            epochs_without_improvement += 1
            if epochs_without_improvement >= args.patience:
                print("early stopping")
                break

    (output_dir / "history.json").write_text(
        json.dumps(history, indent=2), encoding="utf-8"
    )

    if test_data is not None:
        best = torch.load(output_dir / "best.pt", map_location=device, weights_only=True)
        model.load_state_dict(best["model_state_dict"])
        test_dataset = JobMatchDataset(test_data, tokenizer, args.max_length, weights)
        test_sampler = JobGroupedBatchSampler(
            test_dataset.job_group_ids,
            args.batch_size,
            labels=test_data["label"],
            shuffle=False,
        )
        test_loader = DataLoader(
            test_dataset,
            batch_sampler=test_sampler,
            collate_fn=collator,
            num_workers=args.num_workers,
            pin_memory=device.type == "cuda",
        )
        test_metrics = run_epoch(
            model,
            test_loader,
            device,
            args.ranking_weight,
            args.ranking_margin,
            use_amp=use_amp,
        )
        (output_dir / "test_metrics.json").write_text(
            json.dumps(test_metrics, indent=2), encoding="utf-8"
        )
        print("test", json.dumps(test_metrics, indent=2))


if __name__ == "__main__":
    main()
