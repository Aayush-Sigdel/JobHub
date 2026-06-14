import torch.nn as nn
import torch.nn.functional as F
from transformers import AutoModel

class DualEncoder(nn.Module):

    def __init__(self, model_name="bert-base-uncased", hidden_dim=768):
        super().__init__()
        self.encoder = AutoModel.from_pretrained(model_name)
        self.proj = nn.Linear(hidden_dim, 256)

    def forward(self, input_ids, attention_mask):
        out = self.encoder(
            input_ids=input_ids,
            attention_mask=attention_mask
        )

        cls = out.last_hidden_state[:, 0, :]
        emb = self.proj(cls)
        emb = F.normalize(emb, dim=-1)
        return emb
