import { useState, useEffect } from 'react';

export interface LocalSavedJob {
  jobId: string;
  jobTitle: string;
  companyName: string;
  savedAt: string;
}

export interface LocalInProgressJob {
  jobId: string;
  jobTitle: string;
  companyName: string;
  draftData: any;
  updatedAt: string;
}

export const useLocalSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<LocalSavedJob[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('jobhub_saved_jobs');
      if (stored) setSavedJobs(JSON.parse(stored));
    } catch (e) { console.error('Failed to parse saved jobs from local storage', e); }
  }, []);

  const toggleSaveJob = (job: LocalSavedJob) => {
    setSavedJobs((prev) => {
      const isSaved = prev.some((j) => j.jobId === job.jobId);
      const updated = isSaved ? prev.filter((j) => j.jobId !== job.jobId) : [...prev, job];
      localStorage.setItem('jobhub_saved_jobs', JSON.stringify(updated));
      return updated;
    });
  };

  const isSaved = (jobId: string) => savedJobs.some((j) => j.jobId === jobId);
  return { savedJobs, toggleSaveJob, isSaved };
};

export const useLocalInProgressJobs = () => {
  const [inProgressJobs, setInProgressJobs] = useState<LocalInProgressJob[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('jobhub_in_progress_jobs');
      if (stored) setInProgressJobs(JSON.parse(stored));
    } catch (e) { console.error('Failed to parse in progress jobs from local storage', e); }
  }, []);

  return { inProgressJobs };
};
