import { contextBridge, ipcRenderer } from 'electron';

// Type definitions for the exposed API
export interface ElectronAPI {
    // Job operations
    jobs: {
        getAll: () => Promise<IpcResult<JobApplication[]>>;
        getById: (id: string) => Promise<IpcResult<JobApplication>>;
        create: (job: CreateJobDTO) => Promise<IpcResult<JobApplication>>;
        update: (id: string, updates: UpdateJobDTO) => Promise<IpcResult<JobApplication>>;
        delete: (id: string) => Promise<IpcResult<void>>;
    };
    // Round operations
    rounds: {
        add: (jobId: string, round: Omit<InterviewRound, 'id'>) => Promise<IpcResult<InterviewRound>>;
        update: (roundId: string, updates: Partial<Omit<InterviewRound, 'id'>>) => Promise<IpcResult<InterviewRound>>;
        delete: (roundId: string) => Promise<IpcResult<void>>;
    };
    // Attachment operations
    attachments: {
        save: (jobId: string, fileData: ArrayBuffer, fileName: string, mimeType: string) => Promise<IpcResult<Attachment>>;
        get: (storageId: string) => Promise<IpcResult<{ data: ArrayBuffer; metadata: StoredFileMetadata }>>;
        delete: (attachmentId: string) => Promise<IpcResult<void>>;
    };
    // Migration operations
    migration: {
        importLegacyData: (jobs: CreateJobDTO[]) => Promise<IpcResult<{ importedCount: number }>>;
        checkExistingData: () => Promise<IpcResult<{ hasData: boolean; count: number }>>;
    };
}

// Shared types (mirrored from repository)
interface IpcResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface JobApplication {
    id: string;
    company: string;
    position: string;
    status: 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
    dateApplied: string;
    salary?: string;
    location?: string;
    jobUrl?: string;
    description?: string;
    rounds: InterviewRound[];
    rejectionReason?: string;
    rejectionStage?: 'Shortlisting' | 'Online Assessment' | 'Technical Interview' | 'HR Interview';
    learnings?: string;
    attachments: Attachment[];
    createdAt: string;
    updatedAt: string;
}

interface InterviewRound {
    id: string;
    type: 'Screening' | 'Technical' | 'System Design' | 'Behavioral' | 'HR' | 'Other';
    date: string;
    notes: string;
    todos: Todo[];
    completed: boolean;
}

interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

interface Attachment {
    id: string;
    storageId: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
}

interface CreateJobDTO {
    company: string;
    position: string;
    status: JobApplication['status'];
    dateApplied: string;
    salary?: string;
    location?: string;
    jobUrl?: string;
    description?: string;
    rejectionReason?: string;
    rejectionStage?: JobApplication['rejectionStage'];
    learnings?: string;
    rounds?: Omit<InterviewRound, 'id'>[];
    attachments?: Attachment[];
}

interface UpdateJobDTO {
    company?: string;
    position?: string;
    status?: JobApplication['status'];
    dateApplied?: string;
    salary?: string;
    location?: string;
    jobUrl?: string;
    description?: string;
    rejectionReason?: string;
    rejectionStage?: JobApplication['rejectionStage'];
    learnings?: string;
}

interface StoredFileMetadata {
    storageId: string;
    filePath: string;
    originalName: string;
    mimeType: string;
    createdAt: string;
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    jobs: {
        getAll: () => ipcRenderer.invoke('jobs:getAll'),
        getById: (id: string) => ipcRenderer.invoke('jobs:getById', id),
        create: (job: CreateJobDTO) => ipcRenderer.invoke('jobs:create', job),
        update: (id: string, updates: UpdateJobDTO) => ipcRenderer.invoke('jobs:update', id, updates),
        delete: (id: string) => ipcRenderer.invoke('jobs:delete', id),
    },
    rounds: {
        add: (jobId: string, round: Omit<InterviewRound, 'id'>) => ipcRenderer.invoke('rounds:add', jobId, round),
        update: (roundId: string, updates: Partial<Omit<InterviewRound, 'id'>>) => ipcRenderer.invoke('rounds:update', roundId, updates),
        delete: (roundId: string) => ipcRenderer.invoke('rounds:delete', roundId),
    },
    attachments: {
        save: (jobId: string, fileData: ArrayBuffer, fileName: string, mimeType: string) =>
            ipcRenderer.invoke('attachments:save', jobId, fileData, fileName, mimeType),
        get: (storageId: string) => ipcRenderer.invoke('attachments:get', storageId),
        delete: (attachmentId: string) => ipcRenderer.invoke('attachments:delete', attachmentId),
    },
    migration: {
        importLegacyData: (jobs: CreateJobDTO[]) => ipcRenderer.invoke('migration:importLegacyData', jobs),
        checkExistingData: () => ipcRenderer.invoke('migration:checkExistingData'),
    },
} as ElectronAPI);
