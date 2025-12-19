import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type {
  JobApplication,
  JobStatus,
  InterviewRound,
  Attachment,
} from '../../shared/types';

interface JobContextType {
  jobs: JobApplication[];
  addJob: (job: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJob: (id: string, updates: Partial<JobApplication>) => void;
  deleteJob: (id: string) => void;
  moveJob: (id: string, newStatus: JobStatus) => void;
  addRound: (jobId: string, round: Omit<InterviewRound, 'id'>) => void;
  updateRound: (
    jobId: string,
    roundId: string,
    updates: Partial<InterviewRound>
  ) => void;
  deleteRound: (jobId: string, roundId: string) => void;
  addAttachment: (jobId: string, attachment: Attachment) => void;
  deleteAttachment: (jobId: string, attachmentId: string) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load jobs from SQLite on mount
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        const result = await window.electronAPI.jobs.getAll();
        if (result.success && result.data) {
          setJobs(result.data);
        } else {
          setError(result.error || 'Failed to load jobs');
        }
      } catch (err) {
        console.error('Error loading jobs:', err);
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, []);

  const addJob = useCallback(
    async (job: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const result = await window.electronAPI.jobs.create({
          company: job.company,
          position: job.position,
          status: job.status,
          dateApplied: job.dateApplied,
          salary: job.salary,
          location: job.location,
          jobUrl: job.jobUrl,
          description: job.description,
          rejectionReason: job.rejectionReason,
          rejectionStage: job.rejectionStage,
          learnings: job.learnings,
          rounds: job.rounds,
          attachments: job.attachments,
        });

        if (result.success && result.data) {
          setJobs((prev) => [result.data!, ...prev]);
        } else {
          console.error('Failed to add job:', result.error);
        }
      } catch (err) {
        console.error('Error adding job:', err);
      }
    },
    []
  );

  const updateJob = useCallback(
    async (id: string, updates: Partial<JobApplication>) => {
      try {
        const result = await window.electronAPI.jobs.update(id, {
          company: updates.company,
          position: updates.position,
          status: updates.status,
          dateApplied: updates.dateApplied,
          salary: updates.salary,
          location: updates.location,
          jobUrl: updates.jobUrl,
          description: updates.description,
          rejectionReason: updates.rejectionReason,
          rejectionStage: updates.rejectionStage,
          learnings: updates.learnings,
        });

        if (result.success && result.data) {
          setJobs((prev) =>
            prev.map((job) => (job.id === id ? result.data! : job))
          );
        } else {
          console.error('Failed to update job:', result.error);
        }
      } catch (err) {
        console.error('Error updating job:', err);
      }
    },
    []
  );

  const deleteJob = useCallback(async (id: string) => {
    try {
      const result = await window.electronAPI.jobs.delete(id);
      if (result.success) {
        setJobs((prev) => prev.filter((job) => job.id !== id));
      } else {
        console.error('Failed to delete job:', result.error);
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  }, []);

  const moveJob = useCallback(
    (id: string, newStatus: JobStatus) => {
      updateJob(id, { status: newStatus });
    },
    [updateJob]
  );

  const addRound = useCallback(
    async (jobId: string, round: Omit<InterviewRound, 'id'>) => {
      try {
        const result = await window.electronAPI.rounds.add(jobId, round);
        if (result.success && result.data) {
          setJobs((prev) =>
            prev.map((job) =>
              job.id === jobId
                ? {
                  ...job,
                  rounds: [...job.rounds, result.data!],
                  updatedAt: new Date().toISOString(),
                }
                : job
            )
          );
        } else {
          console.error('Failed to add round:', result.error);
        }
      } catch (err) {
        console.error('Error adding round:', err);
      }
    },
    []
  );

  const updateRound = useCallback(
    async (
      jobId: string,
      roundId: string,
      updates: Partial<InterviewRound>
    ) => {
      try {
        const result = await window.electronAPI.rounds.update(roundId, {
          type: updates.type,
          date: updates.date,
          notes: updates.notes,
          completed: updates.completed,
          todos: updates.todos,
        });

        if (result.success && result.data) {
          setJobs((prev) =>
            prev.map((job) =>
              job.id === jobId
                ? {
                  ...job,
                  rounds: job.rounds.map((r) =>
                    r.id === roundId ? result.data! : r
                  ),
                  updatedAt: new Date().toISOString(),
                }
                : job
            )
          );
        } else {
          console.error('Failed to update round:', result.error);
        }
      } catch (err) {
        console.error('Error updating round:', err);
      }
    },
    []
  );

  const deleteRound = useCallback(async (jobId: string, roundId: string) => {
    try {
      const result = await window.electronAPI.rounds.delete(roundId);
      if (result.success) {
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
      } else {
        console.error('Failed to delete round:', result.error);
      }
    } catch (err) {
      console.error('Error deleting round:', err);
    }
  }, []);

  const addAttachment = useCallback(
    async (jobId: string, attachment: Attachment) => {
      // For Electron, attachments are added via file save which handles both(backend side logic)
      // Here we need to update state if we want optimistic UI or wait for reload.
      // The current implementation seemed to assume attachment upload also sends back the attachment object, 
      // but here we just take the input. 
      // Actually, in `ipcHandlers.ts`, `attachments:save` adds it to the job.
      // But `addAttachment` here implies we might need to manually update state.
      // However, the `attachments:save` handler returns `{ success: true, data: attachment }`.
      // The frontend calling `window.electronAPI.attachments.save` usually happens in a component, then it calls `addAttachment` in context?
      // Wait, `addAttachment` in context is:
      // const addAttachment = ... setJobs ...
      // But where is it called?
      // If we look at `ipcHandlers`, save returns the attachment.
      // If the component calls save, it gets the attachment, then calls context.addAttachment to update UI.

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
    },
    []
  );

  const deleteAttachment = useCallback(
    async (jobId: string, attachmentId: string) => {
      try {
        const result = await window.electronAPI.attachments.delete(attachmentId);
        if (result.success) {
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
        } else {
          console.error('Failed to delete attachment:', result.error);
        }
      } catch (err) {
        console.error('Error deleting attachment:', err);
      }
    },
    []
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading your job applications...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center text-red-500">
          <p className="text-xl mb-2">Error loading data</p>
          <p className="text-sm opacity-70">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
