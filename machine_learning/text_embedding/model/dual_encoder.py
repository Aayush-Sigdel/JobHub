import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import AutoModel


class DualEncoder(nn.Module):
    def __init__(
        self,
        model_name="allenai/longformer-base-4096",
        embedding_dim=256,
        gradient_checkpointing=False,
    ):
        super().__init__()

        self.encoder = AutoModel.from_pretrained(model_name)
        self.proj = nn.Linear(self.encoder.config.hidden_size, embedding_dim)

        if gradient_checkpointing and hasattr(self.encoder, "gradient_checkpointing_enable"):
            self.encoder.gradient_checkpointing_enable()

    def mean_pool(self, last_hidden_state, attention_mask):
        mask = attention_mask.unsqueeze(-1).float()
        return (last_hidden_state * mask).sum(dim=1) / mask.sum(dim=1).clamp(min=1e-9)

    def forward(self, input_ids, attention_mask):
        model_inputs = {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
        }
        if hasattr(self.encoder.config, "attention_window"):
            global_attention_mask = torch.zeros_like(attention_mask)
            global_attention_mask[:, 0] = 1
            model_inputs["global_attention_mask"] = global_attention_mask

        out = self.encoder(**model_inputs)

        emb = self.mean_pool(out.last_hidden_state, attention_mask)
        emb = self.proj(emb)

        return F.normalize(emb, dim=-1)
