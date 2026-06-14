import torch
from torch.utils.data import Dataset

class JobMatchDataset(Dataset):
    def __init__(self, data, tokenizer, max_len=512):
        self.data = data
        self.tokenizer = tokenizer
        self.max_len = max_len

        self.label_map = {
            "No Fit": 0.0,
            "Potential Fit": 0.5,
            "Good Fit": 1.0
        }

    def __len__(self):
        return len(self.data)

    def encode(self, text):
        return self.tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=self.max_len,
            return_tensors="pt"
        )

    def __getitem__(self, idx):
        item = self.data[idx]
        resume = self.encode(item["resume_text"])
        job = self.encode(item["job_text"])
        label = torch.tensor(self.label_map[item["label"]], dtype=torch.float)
        return {
            "resume_input_ids": resume["input_ids"].squeeze(0),
            "resume_attention": resume["attention_mask"].squeeze(0),
            "job_input_ids": job["input_ids"].squeeze(0),
            "job_attention": job["attention_mask"].squeeze(0),
            "label": label
        }