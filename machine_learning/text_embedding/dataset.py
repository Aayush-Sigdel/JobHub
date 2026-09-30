import torch
from torch.utils.data import Dataset

from config import DEFAULT_MAX_LENGTH, LABEL_SCORES

class JobMatchDataset(Dataset):
    def __init__(self, data):
        self.data = data

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        return item["resume"] or "", item["jd"] or "", LABEL_SCORES[item["label"]]


class JobMatchCollator:

    def __init__(self, tokenizer, max_len=DEFAULT_MAX_LENGTH):
        self.tokenizer = tokenizer
        self.max_len = max_len

    def tokenize(self, texts):
        return self.tokenizer(
            list(texts),
            padding=True,
            truncation=True,
            max_length=self.max_len,
            return_tensors="pt",
        )

    def __call__(self, items):
        resumes, jobs, labels = zip(*items)
        resume_tokens = self.tokenize(resumes)
        job_tokens = self.tokenize(jobs)
        return {
            "resume_input_ids": resume_tokens["input_ids"],
            "resume_attention": resume_tokens["attention_mask"],
            "job_input_ids": job_tokens["input_ids"],
            "job_attention": job_tokens["attention_mask"],
            "label": torch.tensor(labels, dtype=torch.float),
        }
