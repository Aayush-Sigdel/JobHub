import torch.nn as nn
import torch.nn.functional as F
from model.dual_encoder import DualEncoder

class JobMatchModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = DualEncoder()

    def forward(self, resume_ids, resume_mask, job_ids, job_mask):
        resume_emb = self.encoder(resume_ids, resume_mask)
        job_emb = self.encoder(job_ids, job_mask)

        similarity = F.cosine_similarity(resume_emb, job_emb)

        return similarity