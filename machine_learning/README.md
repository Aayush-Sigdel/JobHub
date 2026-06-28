# ML - recommendation system

This project trains a dual-encoder model for semantic matching between candidates and projects, candidates and other candidates, and candidates and jobs. It also includes a FastAPI backend that uses the model and generates embedding for given input text.

---

## Project Structure

```text
text_embedding/
├── api/
│   └── main.py          # FastAPI server
├── model/               # Model architecture
├── train.py             # Model training
├── dataset.py
├── utils.py
├── requirements.txt
└── ...
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

## Training

Enter directory

```bash
cd text_embedding
```


Run the training script:

```bash
python train.py
```

The trained checkpoints will be saved inside the `checkpoints/` directory.

---

## Running the Embedding API


Enter directory

```bash
cd text_embedding
```

Start the FastAPI server:

```bash
uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload
```

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

---

## Notes

- The API accepts any text (resume, job description, or other document).
- Returned embeddings are L2-normalized and can be directly used for cosine similarity.
- For best results, compare embeddings using cosine similarity.