from fastapi import FastAPI
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer

from model.job_match import JobMatchModel

MODEL = "checkpoints/epoch2/job_matchepoch2.pt"
MAX_LEN = 1024

device = "cuda" if torch.cuda.is_available() else "cpu"

tokenizer = AutoTokenizer.from_pretrained("allenai/longformer-base-4096")

model = JobMatchModel().to(device)
model.load_state_dict(torch.load(MODEL, map_location=device))
model.eval()

app = FastAPI()

class EmbeddingRequest(BaseModel):
    text: str


def encode(text):
    tokens = tokenizer(
        text,
        padding="max_length",
        truncation=True,
        max_length=MAX_LEN,
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

    return {
        "embedding": embedding.squeeze(0).cpu().tolist()
    }