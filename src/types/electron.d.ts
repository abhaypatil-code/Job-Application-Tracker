// Type declarations for the Electron API exposed via preload script

import type {
    JobApplication,
    InterviewRound,
    Attachment,
    CreateJobDTO,
    UpdateJobDTO,
} from '../../shared/types';

export interface IpcResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface StoredFileMetadata {
    storageId: string;
    filePath: string;
    originalName: string;
    mimeType: string;
    createdAt: string;
}

export interface ElectronAPI {
    jobs: {
        getAll: () => Promise<IpcResult<JobApplication[]>>;
        getById: (id: string) => Promise<IpcResult<JobApplication>>;
        create: (job: CreateJobDTO) => Promise<IpcResult<JobApplication>>;
        update: (id: string, updates: UpdateJobDTO) => Promise<IpcResult<JobApplication>>;
        delete: (id: string) => Promise<IpcResult<void>>;
    };
    rounds: {
        add: (jobId: string, round: Omit<InterviewRound, 'id'>) => Promise<IpcResult<InterviewRound>>;
        update: (roundId: string, updates: Partial<Omit<InterviewRound, 'id'>>) => Promise<IpcResult<InterviewRound>>;
        delete: (roundId: string) => Promise<IpcResult<void>>;
    };
    attachments: {
        save: (jobId: string, fileData: ArrayBuffer, fileName: string, mimeType: string) => Promise<IpcResult<Attachment>>;
        get: (storageId: string) => Promise<IpcResult<{ data: ArrayBuffer; metadata: StoredFileMetadata }>>;
        delete: (attachmentId: string) => Promise<IpcResult<void>>;
    };
    migration: {
        importLegacyData: (jobs: CreateJobDTO[]) => Promise<IpcResult<{ importedCount: number }>>;
        checkExistingData: () => Promise<IpcResult<{ hasData: boolean; count: number }>>;
    };
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
