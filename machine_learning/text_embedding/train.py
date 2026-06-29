import os

import torch
import torch.nn.functional as F
from dataset import JobMatchDataset
from datasets import load_dataset
from model.job_match import JobMatchModel
from torch.utils.data import DataLoader
from transformers import AutoModel, AutoTokenizer

os.makedirs("checkpoints", exist_ok=True)

def loss_fn(pred, target):
    return F.mse_loss(pred, target)

def train(model, loader, optimizer, device):
    model.train()
    total_loss = 0

    for step, batch in enumerate(loader):
        resume_ids = batch["resume_input_ids"].to(device)
        resume_mask = batch["resume_attention"].to(device)
        job_ids = batch["job_input_ids"].to(device)
        job_mask = batch["job_attention"].to(device)
        labels = batch["label"].to(device)

        preds = model(resume_ids, resume_mask, job_ids, job_mask)
        loss = loss_fn(preds, labels)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        print(f"Step {step}/{len(loader)} | Loss: {loss.item():.4f}")

    return total_loss / len(loader)


device = "cuda" if torch.cuda.is_available() else "cpu"
ds = load_dataset("votanthanh32004/resume-job-fit-cleaned")
train_data = ds["train"]

tokenizer = AutoTokenizer.from_pretrained("allenai/longformer-base-4096")
dataset = JobMatchDataset(train_data, tokenizer)
loader = DataLoader(dataset, batch_size=8, shuffle=True)

model = JobMatchModel().to(device)
optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)

for epoch in range(5):
    loss = train(model, loader, optimizer, device)
    print(f"Epoch {epoch}, Loss: {loss:.4f}")
    torch.save(model.state_dict(), f"checkpoints/job_matchepoch{epoch}.pt")
    torch.save(model.encoder.state_dict(), f"checkpoints/dual_encoderepoch{epoch}.pt")


torch.save(model.state_dict(), "checkpoints/job_match_final.pt")
torch.save(model.encoder.state_dict(), "checkpoints/dual_encoder_final.pt")
tokenizer.save_pretrained("checkpoints/tokenizer")
