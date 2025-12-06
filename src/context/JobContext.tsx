import React, { createContext, useContext, useEffect, useState } from 'react';
import type {
  JobApplication,
  JobContextType,
  JobStatus,
  InterviewRound,
  Attachment,
} from '../types';

const JobContext = createContext<JobContextType | undefined>(undefined);

const STORAGE_KEY = 'job-application-tracker-data';

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [jobs, setJobs] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  const addJob = (
    job: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newJob: JobApplication = {
      ...job,
      id: crypto.randomUUID(),
      attachments: job.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJobs((prev) => [newJob, ...prev]);
  };

  const updateJob = (id: string, updates: Partial<JobApplication>) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === id
          ? { ...job, ...updates, updatedAt: new Date().toISOString() }
          : job
      )
    );
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  };

  const moveJob = (id: string, newStatus: JobStatus) => {
    updateJob(id, { status: newStatus });
  };

  const addRound = (jobId: string, round: Omit<InterviewRound, 'id'>) => {
    const newRound: InterviewRound = {
      ...round,
      id: crypto.randomUUID(),
    };
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
            ...job,
            rounds: [...job.rounds, newRound],
            updatedAt: new Date().toISOString(),
          }
          : job
      )
    );
  };

  const updateRound = (
    jobId: string,
    roundId: string,
    updates: Partial<InterviewRound>
  ) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
            ...job,
            rounds: job.rounds.map((r) =>
              r.id === roundId ? { ...r, ...updates } : r
            ),
            updatedAt: new Date().toISOString(),
          }
          : job
      )
    );
  };

  const deleteRound = (jobId: string, roundId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
            ...job,
            rounds: job.rounds.filter((r) => r.id !== roundId),
            updatedAt: new Date().toISOString(),
          }
          : job
      )
    );
  };

  const addAttachment = (jobId: string, attachment: Attachment) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
            ...job,
            attachments: [...(job.attachments || []), attachment],
            updatedAt: new Date().toISOString(),
          }
          : job
      )
    );
  };

  const deleteAttachment = (jobId: string, attachmentId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
            ...job,
            attachments: (job.attachments || []).filter(
              (a) => a.id !== attachmentId
            ),
            updatedAt: new Date().toISOString(),
          }
          : job
      )
    );
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        addJob,
        updateJob,
        deleteJob,
        moveJob,
        addRound,
        updateRound,
        deleteRound,
        addAttachment,
        deleteAttachment,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
