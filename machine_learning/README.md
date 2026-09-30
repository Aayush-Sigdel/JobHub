# job embedding model

This project trains a shared dual encoder for ATS matching. Candidate profile text and job text are independently converted to normalized 256-dimensional vectors; the JobHub backend ranks applicants with cosine similarity.

---

## Project Structure

```text
text_embedding/
├── api/
│   └── main.py          # FastAPI server
├── model/               # Model architecture
├── analyze_lengths.py   # Dataset token-length audit
├── config.py            # Shared model/preprocessing defaults
├── dataset.py           # Dataset and batch tokenizer/collator
├── train.py             # Training, validation, and checkpointing
└── tests/
```

---


## Requirements

- Python 3.10+
- pip

Create and activate a virtual environment (recommended):

### Linux/macOS

```bash
python -m venv .venv
source .venv/bin/activate
```

### Windows

```powershell
python -m venv .venv
.venv\Scripts\activate
```

Install all required packages:

```bash
pip install -r requirements.txt
```

---

## Running the Embedding API


Enter directory

```bash
cd text_embedding
```

After training, start the FastAPI server:

```bash
uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload
```

To serve a checkpoint elsewhere, set `EMBEDDING_MODEL_PATH=/path/to/best.pt`.

The API will be available at:

```
http://localhost:8001
```


---

## API Usage

### Generate Embedding

**Endpoint**

```
POST /embed
```

### Request

The API accepts any text (resume, job description, or other document).

```json
{
  "text": "Experienced Software Engineer with expertise in Python, FastAPI, PyTorch, Docker, PostgreSQL, and AWS."
}
```

### Response

```json
{
  "embedding": [
    -0.0555,
    0.0807,
    0.0070,
    ...
  ]
}
```

The returned embedding is a normalized **256-dimensional** vector.

---

## Testing with cURL

```bash
curl -X POST http://localhost:8001/embed \
-H "Content-Type: application/json" \
-d '{
    "text":"Experienced Software Engineer with expertise in Python and FastAPI."
}'
```

---

## Model Architecture

- Backbone: **Longformer Base (allenai/longformer-base-4096)**
- Hidden Size: **768**
- Pooling: Mean Pooling
- Projection Layer: **768 → 256**
- Output Embedding: **256-dimensional**
- Similarity Metric: Cosine Similarity

