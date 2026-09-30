import argparse
import json
import random
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from dataset import JobMatchCollator, JobMatchDataset
from datasets import load_dataset
from model.job_match import JobMatchModel
from torch.utils.data import DataLoader
from transformers import AutoTokenizer, get_linear_schedule_with_warmup

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
LEARNING_RATE = 2e-5
WARMUP_RATIO = 0.1
VALIDATION_RATIO = 0.1
SEED = 42


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
    return data.select_columns(["resume", "jd", "label"])


def split_by_resume(data, validation_ratio, seed):
    resumes = sorted(set(data["resume"]))
    random.Random(seed).shuffle(resumes)
    validation_resumes = set(resumes[: max(1, round(len(resumes) * validation_ratio))])
    train_indices = []
    validation_indices = []
    for index, resume in enumerate(data["resume"]):
        if resume in validation_resumes:
            validation_indices.append(index)
        else:
            train_indices.append(index)
    return data.select(train_indices), data.select(validation_indices)


def predict(model, batch):
    return model(
        batch["resume_input_ids"],
        batch["resume_attention"],
        batch["job_input_ids"],
        batch["job_attention"],
    )


def train_one_epoch(model, loader, optimizer, scheduler, scaler, device, use_amp):
    model.train()
    total_loss = 0.0
    for step, batch in enumerate(loader):
        batch = {key: value.to(device) for key, value in batch.items()}
        with torch.autocast(device_type=device.type, enabled=use_amp):
            scores = predict(model, batch)
        loss = F.mse_loss(scores.float(), batch["label"])

        optimizer.zero_grad()
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()
        scheduler.step()

        total_loss += loss.item()
        if (step + 1) % 50 == 0:
            print(f"  batch {step + 1}/{len(loader)} loss={loss.item():.4f}", flush=True)
    return total_loss / len(loader)


def score_metrics(scores, targets):
    scores = torch.as_tensor(scores, dtype=torch.float)
    targets = torch.as_tensor(targets, dtype=torch.float)
    bins = torch.tensor([0.25, 0.75])
    predicted_labels = torch.bucketize(scores, bins, right=True)
    true_labels = torch.bucketize(targets, bins, right=True)
    return {
        "loss": F.mse_loss(scores, targets).item(),
        "mae": (scores - targets).abs().mean().item(),
        "accuracy": (predicted_labels == true_labels).float().mean().item(),
    }


def evaluate(model, loader, device, use_amp):
    model.eval()
    all_scores = []
    all_targets = []
    with torch.no_grad():
        for batch in loader:
            batch = {key: value.to(device) for key, value in batch.items()}
            with torch.autocast(device_type=device.type, enabled=use_amp):
                scores = predict(model, batch)
            all_scores.append(scores.float().cpu())
            all_targets.append(batch["label"].cpu())
    return score_metrics(torch.cat(all_scores), torch.cat(all_targets))


def main():
    args = parse_args()
    set_seed(SEED)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    use_amp = device.type == "cuda"
    print(f"device={device} amp={use_amp}")

    data = normalize_columns(load_dataset(args.dataset)["train"])
    train_data, validation_data = split_by_resume(data, VALIDATION_RATIO, SEED)
    print(f"rows train={len(train_data)} validation={len(validation_data)}")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    collator = JobMatchCollator(tokenizer, DEFAULT_MAX_LENGTH)
    train_loader = DataLoader(
        JobMatchDataset(train_data),
        batch_size=BATCH_SIZE,
        shuffle=True,
        collate_fn=collator,
    )
    validation_loader = DataLoader(
        JobMatchDataset(validation_data),
        batch_size=BATCH_SIZE,
        collate_fn=collator,
    )

    model = JobMatchModel(
        model_name=MODEL_NAME,
        embedding_dim=EMBEDDING_DIM,
        gradient_checkpointing=True,
    ).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE)
    total_steps = len(train_loader) * args.epochs
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=round(total_steps * WARMUP_RATIO),
        num_training_steps=total_steps,
    )
    scaler = torch.amp.GradScaler(device.type, enabled=use_amp)

    run_config = {
        "dataset": args.dataset,
        "model_name": MODEL_NAME,
        "max_length": DEFAULT_MAX_LENGTH,
        "embedding_dim": EMBEDDING_DIM,
        "label_scores": LABEL_SCORES,
        "epochs": args.epochs,
        "batch_size": BATCH_SIZE,
        "learning_rate": LEARNING_RATE,
    }
    (output_dir / "training_config.json").write_text(
        json.dumps(run_config, indent=2), encoding="utf-8"
    )
    tokenizer.save_pretrained(output_dir / "tokenizer")

    history = []
    best_loss = float("inf")
    for epoch in range(args.epochs):
        print(f"epoch {epoch + 1}/{args.epochs}")
        train_loss = train_one_epoch(
            model, train_loader, optimizer, scheduler, scaler, device, use_amp
        )
        validation_metrics = evaluate(model, validation_loader, device, use_amp)
        epoch_metrics = {
            "epoch": epoch,
            "train_loss": train_loss,
            "validation": validation_metrics,
        }
        history.append(epoch_metrics)
        print(json.dumps(epoch_metrics, indent=2))

        if validation_metrics["loss"] < best_loss:
            best_loss = validation_metrics["loss"]
            torch.save(
                {
                    "format_version": 2,
                    "model_state_dict": model.state_dict(),
                    "epoch": epoch,
                    "metrics": epoch_metrics,
                    "config": run_config,
                },
                output_dir / "best.pt",
            )
            print(f"saved new best model (validation loss {best_loss:.4f})")

    (output_dir / "history.json").write_text(
        json.dumps(history, indent=2), encoding="utf-8"
    )


if __name__ == "__main__":
    main()
