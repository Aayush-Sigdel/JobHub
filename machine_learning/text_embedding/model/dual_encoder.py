import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import AutoModel

class DualEncoder(nn.Module):
    def __init__(
        self,
        model_name="allenai/longformer-base-4096",
        hidden_dim=768,
    ):
        super().__init__()

        self.encoder = AutoModel.from_pretrained(model_name)
        self.proj = nn.Linear(hidden_dim, 256)

    def mean_pool(self, last_hidden_state, attention_mask):
        mask = attention_mask.unsqueeze(-1).float()
        return (last_hidden_state * mask).sum(dim=1) / mask.sum(dim=1).clamp(min=1e-9)

    def forward(self, input_ids, attention_mask):
        global_attention_mask = None
        if hasattr(self.encoder.config, "attention_window"):
            global_attention_mask = torch.zeros_like(attention_mask)
            global_attention_mask[:, 0] = 1

        out = self.encoder(
            input_ids=input_ids,
            attention_mask=attention_mask,
            global_attention_mask=global_attention_mask,
        )

        emb = self.mean_pool(out.last_hidden_state, attention_mask)
        emb = self.proj(emb)

        return F.normalize(emb, dim=-1)