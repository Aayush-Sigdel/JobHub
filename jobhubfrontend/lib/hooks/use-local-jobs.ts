import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface LocalSavedJob {
  jobId: string;
  jobTitle: string;
  companyName: string;
  savedAt: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobType?: string;
  workplaceType?: string;
}

export interface LocalInProgressJob {
  jobId: string;
  jobTitle: string;
  companyName: string;
  draftData: Record<string, unknown> | null;
  updatedAt: string;
}

const SAVED_JOBS_KEY = 'jobhub_saved_jobs';
const SAVED_JOBS_EVENT = 'jobhub_saved_jobs_changed';

export const useLocalSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<LocalSavedJob[]>([]);

  const loadFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(SAVED_JOBS_KEY);
      if (stored) {
        setSavedJobs(JSON.parse(stored));
      } else {
        setSavedJobs([]);
      }
    } catch (e) {
      console.error('Failed to parse saved jobs from local storage', e);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => loadFromStorage();
    queueMicrotask(handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(SAVED_JOBS_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(SAVED_JOBS_EVENT, handleStorageChange);
    };
  }, [loadFromStorage]);

  const toggleSaveJob = useCallback((job: LocalSavedJob) => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(SAVED_JOBS_KEY);
      const currentList: LocalSavedJob[] = stored ? JSON.parse(stored) : [];
      const exists = currentList.some((j) => j.jobId === job.jobId);
      const updated = exists
        ? currentList.filter((j) => j.jobId !== job.jobId)
        : [job, ...currentList.filter((j) => j.jobId !== job.jobId)];

      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updated));
      setSavedJobs(updated);
      window.dispatchEvent(new Event(SAVED_JOBS_EVENT));

      if (exists) {
        toast.info("Job removed from saved jobs");
      } else {
        toast.success("Job saved to your tracker");
      }
      return !exists;
    } catch (e) {
      console.error("Failed to toggle saved job", e);
      return false;
    }
  }, []);

  const isSaved = useCallback(
    (jobId: string) => savedJobs.some((j) => j.jobId === jobId),
    [savedJobs]
  );

  return { savedJobs, toggleSaveJob, isSaved };
};

const IN_PROGRESS_JOBS_KEY = 'jobhub_in_progress_jobs';
const IN_PROGRESS_JOBS_EVENT = 'jobhub_in_progress_jobs_changed';

export const useLocalInProgressJobs = () => {
  const [inProgressJobs, setInProgressJobs] = useState<LocalInProgressJob[]>([]);

  const loadFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(IN_PROGRESS_JOBS_KEY);
      if (stored) {
        setInProgressJobs(JSON.parse(stored));
      } else {
        setInProgressJobs([]);
      }
    } catch (e) {
      console.error('Failed to parse in progress jobs from local storage', e);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => loadFromStorage();
    queueMicrotask(handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(IN_PROGRESS_JOBS_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(IN_PROGRESS_JOBS_EVENT, handleStorageChange);
    };
  }, [loadFromStorage]);

  const removeInProgressJob = useCallback((jobId: string) => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(IN_PROGRESS_JOBS_KEY);
      const currentList: LocalInProgressJob[] = stored ? JSON.parse(stored) : [];
      const updated = currentList.filter((j) => j.jobId !== jobId);
      localStorage.setItem(IN_PROGRESS_JOBS_KEY, JSON.stringify(updated));
      setInProgressJobs(updated);
      window.dispatchEvent(new Event(IN_PROGRESS_JOBS_EVENT));
      toast.info('Draft removed');
    } catch (e) {
      console.error('Failed to remove in progress job', e);
    }
  }, []);

  return { inProgressJobs, removeInProgressJob };
};
