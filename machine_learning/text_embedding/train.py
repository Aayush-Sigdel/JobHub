import argparse
import json
import math
import random
from collections import Counter
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from dataset import JobGroupedBatchSampler, JobMatchCollator, JobMatchDataset
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

OUTPUT_DIR = "checkpoints/retrained"
EPOCHS = 5
BATCH_SIZE = 2
GRADIENT_ACCUMULATION = 4
LEARNING_RATE = 2e-5
WEIGHT_DECAY = 0.01
WARMUP_RATIO = 0.1
VALIDATION_RATIO = 0.1
# "resume" holds out whole candidates, "jd" holds out whole jobs
VALIDATION_GROUP = "resume"
RANKING_WEIGHT = 0.25
RANKING_MARGIN = 0.10
PATIENCE = 2
SEED = 42
NUM_WORKERS = 0


def parse_args():
    parser = argparse.ArgumentParser(description="Train the resume/job dual encoder")
    parser.add_argument("--dataset", default=DEFAULT_DATASET)
    parser.add_argument("--output-dir", default=OUTPUT_DIR)
    parser.add_argument("--epochs", type=int, default=EPOCHS)
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
    return data.select_columns(["resume", "jd", "label"])


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
):
    training = optimizer is not None
    model.train(training)
    if training:
        optimizer.zero_grad(set_to_none=True)

    totals = {
        "loss": 0.0,
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
                loss, regression, ranking = matching_loss(
                    scores,
                    batch["label"],
                    batch["sample_weight"],
                    batch["job_group_id"],
                    ranking_weight,
                    ranking_margin,
                )

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


def optimizer_and_scheduler(model, loader, epochs):
    if len(loader) == 0:
        raise ValueError("No usable batches were created for training")
    optimizer = torch.optim.AdamW(
        model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY
    )
    optimizer_steps_per_epoch = math.ceil(len(loader) / GRADIENT_ACCUMULATION)
    total_steps = max(1, optimizer_steps_per_epoch * epochs)
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=round(total_steps * WARMUP_RATIO),
        num_training_steps=total_steps,
    )
    return optimizer, scheduler


def main():
    args = parse_args()
    set_seed(SEED)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    use_amp = device.type == "cuda"
    print(f"device={device} amp={use_amp}")

    raw = load_dataset(args.dataset)
    full_train = normalize_columns(raw["train"])
    train_data, validation_data = grouped_split(
        full_train,
        VALIDATION_RATIO,
        SEED,
        group_column=VALIDATION_GROUP,
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
        if test_overlap[VALIDATION_GROUP] > 0:
            print(
                "warning: skipping the published test split because it overlaps "
                f"training on {VALIDATION_GROUP!r}; use the clean validation metrics"
            )
            test_data = None

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    backbone_config = AutoConfig.from_pretrained(MODEL_NAME)
    attention_window = getattr(backbone_config, "attention_window", None)
    if isinstance(attention_window, (list, tuple)):
        attention_window = attention_window[0]
    collator = JobMatchCollator(
        tokenizer, pad_to_multiple_of=attention_window or 8
    )
    train_dataset = JobMatchDataset(train_data, tokenizer, DEFAULT_MAX_LENGTH, weights)
    validation_dataset = JobMatchDataset(
        validation_data, tokenizer, DEFAULT_MAX_LENGTH, weights
    )
    train_sampler = JobGroupedBatchSampler(
        train_dataset.job_group_ids,
        BATCH_SIZE,
        labels=train_data["label"],
        seed=SEED,
    )
    train_loader = DataLoader(
        train_dataset,
        batch_sampler=train_sampler,
        collate_fn=collator,
        num_workers=NUM_WORKERS,
        pin_memory=device.type == "cuda",
    )
    validation_sampler = JobGroupedBatchSampler(
        validation_dataset.job_group_ids,
        BATCH_SIZE,
        labels=validation_data["label"],
        shuffle=False,
    )
    validation_loader = DataLoader(
        validation_dataset,
        batch_sampler=validation_sampler,
        collate_fn=collator,
        num_workers=NUM_WORKERS,
        pin_memory=device.type == "cuda",
    )

    model = JobMatchModel(
        model_name=MODEL_NAME,
        embedding_dim=EMBEDDING_DIM,
        gradient_checkpointing=True,
    ).to(device)
    scaler = torch.amp.GradScaler(device.type, enabled=use_amp)

    run_config = {
        "dataset": args.dataset,
        "model_name": MODEL_NAME,
        "max_length": DEFAULT_MAX_LENGTH,
        "embedding_dim": EMBEDDING_DIM,
        "label_scores": LABEL_SCORES,
        "validation_group": VALIDATION_GROUP,
        "matching_epochs": args.epochs,
        "matching_learning_rate": LEARNING_RATE,
        "ranking_weight": RANKING_WEIGHT,
        "ranking_margin": RANKING_MARGIN,
    }
    (output_dir / "training_config.json").write_text(
        json.dumps(run_config, indent=2), encoding="utf-8"
    )
    tokenizer.save_pretrained(output_dir / "tokenizer")

    history = []
    optimizer, scheduler = optimizer_and_scheduler(model, train_loader, args.epochs)
    start_epoch = 0
    if args.resume_from:
        checkpoint = torch.load(args.resume_from, map_location=device, weights_only=True)
        model.load_state_dict(checkpoint["model_state_dict"])
        optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
        scheduler.load_state_dict(checkpoint["scheduler_state_dict"])
        start_epoch = checkpoint["epoch"] + 1

    best_ndcg = None
    epochs_without_improvement = 0
    for epoch in range(start_epoch, args.epochs):
        print(f"matching epoch {epoch + 1}/{args.epochs}")
        train_sampler.set_epoch(epoch)
        train_metrics = run_epoch(
            model,
            train_loader,
            device,
            RANKING_WEIGHT,
            RANKING_MARGIN,
            optimizer=optimizer,
            scheduler=scheduler,
            scaler=scaler,
            accumulation_steps=GRADIENT_ACCUMULATION,
            use_amp=use_amp,
        )
        validation_metrics = run_epoch(
            model,
            validation_loader,
            device,
            RANKING_WEIGHT,
            RANKING_MARGIN,
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

        ndcg = validation_metrics["ndcg_at_10"]
        if best_ndcg is None or ndcg > best_ndcg:
            best_ndcg = ndcg
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
            if epochs_without_improvement >= PATIENCE:
                print("early stopping")
                break

    (output_dir / "history.json").write_text(
        json.dumps(history, indent=2), encoding="utf-8"
    )

    if test_data is not None:
        best = torch.load(output_dir / "best.pt", map_location=device, weights_only=True)
        model.load_state_dict(best["model_state_dict"])
        test_dataset = JobMatchDataset(test_data, tokenizer, DEFAULT_MAX_LENGTH, weights)
        test_sampler = JobGroupedBatchSampler(
            test_dataset.job_group_ids,
            BATCH_SIZE,
            labels=test_data["label"],
            shuffle=False,
        )
        test_loader = DataLoader(
            test_dataset,
            batch_sampler=test_sampler,
            collate_fn=collator,
            num_workers=NUM_WORKERS,
            pin_memory=device.type == "cuda",
        )
        test_metrics = run_epoch(
            model,
            test_loader,
            device,
            RANKING_WEIGHT,
            RANKING_MARGIN,
            use_amp=use_amp,
        )
        (output_dir / "test_metrics.json").write_text(
            json.dumps(test_metrics, indent=2), encoding="utf-8"
        )
        print("test", json.dumps(test_metrics, indent=2))


if __name__ == "__main__":
    main()
