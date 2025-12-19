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

export interface CreateJobDTO {
    company: string;
    position: string;
    status: JobStatus;
    dateApplied: string;
    salary?: string;
    location?: string;
    jobUrl?: string;
    description?: string;
    rejectionReason?: string;
    rejectionStage?: RejectionStage;
    learnings?: string;
    rounds?: Omit<InterviewRound, 'id'>[];
    attachments?: Attachment[];
}

export interface UpdateJobDTO {
    company?: string;
    position?: string;
    status?: JobStatus;
    dateApplied?: string;
    salary?: string;
    location?: string;
    jobUrl?: string;
    description?: string;
    rejectionReason?: string;
    rejectionStage?: RejectionStage;
    learnings?: string;
}
