export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  source: string; // e.g., 'LinkedIn', 'Indeed', 'Platform UI'
  createdAt: string;
  expiresAt?: string;
}

export interface Candidate {
  id: string;
  name: string; // May be anonymized during early stages
  email: string;
  skills: string[];
  projects: string[];
  experiences: Experience[];
  socialLinks: SocialLink[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface SocialLink {
  platform: 'GitHub' | 'LinkedIn' | 'Portfolio' | 'Other';
  url: string;
}

export interface JobMatch {
  jobId: string;
  candidateId: string;
  matchScore: number;
  matchDetails?: Record<string, any>;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
}
