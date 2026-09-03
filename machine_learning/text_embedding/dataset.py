import random
from collections import defaultdict

import torch
from torch.utils.data import Dataset, Sampler

from config import DEFAULT_MAX_LENGTH, LABEL_SCORES


class JobMatchDataset(Dataset):
    def __init__(self, data, tokenizer, max_len=DEFAULT_MAX_LENGTH, class_weights=None):
        self.data = data
        self.tokenizer = tokenizer
        self.max_len = max_len
        self.label_map = LABEL_SCORES
        self.class_weights = class_weights or {label: 1.0 for label in self.label_map}
        self._token_cache = {}

        job_to_id = {}
        self.job_group_ids = []
        for job_text in data["jd"]:
            if job_text not in job_to_id:
                job_to_id[job_text] = len(job_to_id)
            self.job_group_ids.append(job_to_id[job_text])

    def __len__(self):
        return len(self.data)

    def encode(self, text):
        if not isinstance(text, str) or not text.strip():
            text = ""
        cached = self._token_cache.get(text)
        if cached is not None:
            return cached

        encoded = self.tokenizer(
            text,
            padding=False,
            truncation=True,
            max_length=self.max_len,
        )
        self._token_cache[text] = encoded
        return encoded

    def __getitem__(self, idx):
        item = self.data[idx]

        label_name = item["label"]
        if label_name not in self.label_map:
            raise ValueError(f"Unknown fit label: {label_name!r}")

        resume = self.encode(item["resume"])
        job = self.encode(item["jd"])
        label = torch.tensor(self.label_map[label_name], dtype=torch.float)
        return {
            "resume": dict(resume),
            "job": dict(job),
            "label": label,
            "sample_weight": torch.tensor(
                self.class_weights[label_name], dtype=torch.float
            ),
            "job_group_id": self.job_group_ids[idx],
        }


class JobMatchCollator:
    def __init__(self, tokenizer, pad_to_multiple_of=512):
        self.tokenizer = tokenizer
        self.pad_to_multiple_of = pad_to_multiple_of

    def __call__(self, items):
        resumes = self.tokenizer.pad(
            [item["resume"] for item in items],
            padding=True,
            pad_to_multiple_of=self.pad_to_multiple_of,
            return_tensors="pt",
        )
        jobs = self.tokenizer.pad(
            [item["job"] for item in items],
            padding=True,
            pad_to_multiple_of=self.pad_to_multiple_of,
            return_tensors="pt",
        )
        return {
            "resume_input_ids": resumes["input_ids"],
            "resume_attention": resumes["attention_mask"],
            "job_input_ids": jobs["input_ids"],
            "job_attention": jobs["attention_mask"],
            "label": torch.stack([item["label"] for item in items]),
            "sample_weight": torch.stack([item["sample_weight"] for item in items]),
            "job_group_id": torch.tensor(
                [item["job_group_id"] for item in items], dtype=torch.long
            ),
        }


class JobGroupedBatchSampler(Sampler):
    def __init__(self, job_group_ids, batch_size, labels=None, shuffle=True, seed=42):
        self.batch_size = batch_size
        self.shuffle = shuffle
        self.seed = seed
        self.epoch = 0
        self.groups = defaultdict(list)
        self.labels = labels
        for index, group_id in enumerate(job_group_ids):
            self.groups[group_id].append(index)

    def set_epoch(self, epoch):
        self.epoch = epoch

    def __iter__(self):
        rng = random.Random(self.seed + self.epoch)
        batches = []
        for indices in self.groups.values():
            indices = list(indices)
            if self.shuffle:
                rng.shuffle(indices)
            if self.labels is None:
                grouped_batches = [
                    indices[start : start + self.batch_size]
                    for start in range(0, len(indices), self.batch_size)
                ]
            else:
                by_label = defaultdict(list)
                for index in indices:
                    by_label[self.labels[index]].append(index)
                grouped_batches = []
                while any(by_label.values()):
                    batch = []
                    for label in sorted(by_label):
                        if by_label[label] and len(batch) < self.batch_size:
                            batch.append(by_label[label].pop())
                    while len(batch) < self.batch_size:
                        largest = max(by_label.values(), key=len)
                        if not largest:
                            break
                        batch.append(largest.pop())
                    grouped_batches.append(batch)
            batches.extend(grouped_batches)
        if self.shuffle:
            rng.shuffle(batches)
        yield from batches

    def __len__(self):
        return sum(
            (len(indices) + self.batch_size - 1) // self.batch_size
            for indices in self.groups.values()
        )


class ContrastiveJobBatchSampler(Sampler):
    def __init__(
        self,
        job_group_ids,
        labels,
        batch_size,
        hard_negative_mask=None,
        negatives_per_positive=2,
        shuffle=True,
        seed=42,
    ):
        if batch_size < 2:
            raise ValueError("contrastive training requires batch_size >= 2")
        if negatives_per_positive < 1:
            raise ValueError("negatives_per_positive must be at least 1")
        self.batch_size = batch_size
        self.negatives_per_positive = negatives_per_positive
        self.shuffle = shuffle
        self.seed = seed
        self.epoch = 0
        self.hard_negative_mask = hard_negative_mask or [False] * len(labels)
        self.groups = defaultdict(lambda: {"Good Fit": [], "No Fit": []})
        for index, (group_id, label) in enumerate(zip(job_group_ids, labels)):
            if label in {"Good Fit", "No Fit"}:
                self.groups[group_id][label].append(index)
        self.groups = {
            group_id: values
            for group_id, values in self.groups.items()
            if values["Good Fit"] and values["No Fit"]
        }

    def set_epoch(self, epoch):
        self.epoch = epoch

    def _batches(self):
        rng = random.Random(self.seed + self.epoch)
        batches = []
        negative_slots = self.batch_size - 1
        for values in self.groups.values():
            positives = list(values["Good Fit"])
            negatives = list(values["No Fit"])
            if self.shuffle:
                rng.shuffle(positives)
                rng.shuffle(negatives)

            negatives.sort(
                key=lambda index: self.hard_negative_mask[index], reverse=True
            )
            negative_limit = min(
                len(negatives), len(positives) * self.negatives_per_positive
            )
            selected_negatives = negatives[:negative_limit]
            for start in range(0, len(selected_negatives), negative_slots):
                positive = positives[(start // negative_slots) % len(positives)]
                batches.append(
                    [positive] + selected_negatives[start : start + negative_slots]
                )
        if self.shuffle:
            rng.shuffle(batches)
        return batches

    def __iter__(self):
        yield from self._batches()

    def __len__(self):
        negative_slots = self.batch_size - 1
        total = 0
        for values in self.groups.values():
            negative_count = min(
                len(values["No Fit"]),
                len(values["Good Fit"]) * self.negatives_per_positive,
            )
            total += (negative_count + negative_slots - 1) // negative_slots
        return total
