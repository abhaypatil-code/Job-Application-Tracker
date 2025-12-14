export type JobStatus =
  | 'Wishlist'
  | 'Applied'
  | 'Interview'
  | 'Offer'
  | 'Rejected';

export type InterviewType =
  | 'Screening'
  | 'Technical'
  | 'System Design'
  | 'Behavioral'
  | 'HR'
  | 'Other';

export type RejectionStage =
  | 'Shortlisting'
  | 'Online Assessment'
  | 'Technical Interview'
  | 'HR Interview';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface InterviewRound {
  id: string;
  type: InterviewType;
  date: string; // ISO string
  notes: string;
  todos: Todo[];
  completed: boolean;
}

export interface Attachment {
  id: string;
  storageId: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: JobStatus;
  dateApplied: string; // ISO string
  salary?: string;
  location?: string;
  jobUrl?: string;
  description?: string;
  rounds: InterviewRound[];
  rejectionReason?: string;
  rejectionStage?: RejectionStage;
  learnings?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface JobContextType {
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
