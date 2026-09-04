import os
from pathlib import Path

import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer

from config import EMBEDDING_DIM
from model.job_match import JobMatchModel

MODEL = Path(os.getenv("EMBEDDING_MODEL_PATH", "checkpoints/retrained/best.pt"))

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

checkpoint = torch.load(MODEL, map_location=device, weights_only=True)
if checkpoint.get("format_version") != 2:
    raise ValueError("Unsupported checkpoint; train a new model with text_embedding/train.py")

checkpoint_config = checkpoint["config"]
state_dict = checkpoint["model_state_dict"]
model_name = checkpoint_config["model_name"]
max_length = int(checkpoint_config["max_length"])
embedding_dim = int(checkpoint_config["embedding_dim"])
if embedding_dim != EMBEDDING_DIM:
    raise ValueError(
        f"Checkpoint embedding_dim={embedding_dim}; API contract requires {EMBEDDING_DIM}"
    )

tokenizer_path = MODEL.parent / "tokenizer"
tokenizer_source = tokenizer_path if tokenizer_path.exists() else model_name
tokenizer = AutoTokenizer.from_pretrained(tokenizer_source)

model = JobMatchModel(model_name=model_name, embedding_dim=embedding_dim).to(device)
model.load_state_dict(state_dict)
model.eval()

app = FastAPI()


class EmbeddingRequest(BaseModel):
    text: str


def encode(text):
    tokens = tokenizer(
        text,
        padding=False,
        truncation=True,
        max_length=max_length,
        return_tensors="pt",
    )

    return (
        tokens["input_ids"].to(device),
        tokens["attention_mask"].to(device),
    )

@app.post("/embed")
def embed(request: EmbeddingRequest):
    input_ids, attention_mask = encode(request.text)

    with torch.no_grad():
        embedding = model.encoder(input_ids, attention_mask)

    if embedding.shape != (1, EMBEDDING_DIM):
        raise RuntimeError(f"Model returned unexpected shape: {tuple(embedding.shape)}")

    return {"embedding": embedding.squeeze(0).cpu().tolist()}
