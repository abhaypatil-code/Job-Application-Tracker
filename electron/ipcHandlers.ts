import { ipcMain } from 'electron';
import {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    addRound,
    updateRound,
    deleteRound,
    addAttachment,
    deleteAttachment,
} from './database/repositories/jobRepository';
import type {
    CreateJobDTO,
    UpdateJobDTO,
    InterviewRound,
    Attachment,
} from '../shared/types';
import {
    saveFile,
    getFile,
    deleteFile,
    createAttachmentMetadata,
} from './database/repositories/fileRepository';

/**
 * Register all IPC handlers for database operations
 */
export function registerIpcHandlers(): void {
    // ==================== Job Operations ====================

    ipcMain.handle('jobs:getAll', async () => {
        try {
            return { success: true, data: getAllJobs() };
        } catch (error) {
            console.error('Error getting all jobs:', error);
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle('jobs:getById', async (_, id: string) => {
        try {
            const job = getJobById(id);
            if (!job) {
                return { success: false, error: 'Job not found' };
            }
            return { success: true, data: job };
        } catch (error) {
            console.error('Error getting job by id:', error);
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle('jobs:create', async (_, dto: CreateJobDTO) => {
        try {
            const job = createJob(dto);
            return { success: true, data: job };
        } catch (error) {
            console.error('Error creating job:', error);
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle('jobs:update', async (_, id: string, updates: UpdateJobDTO) => {
        try {
            const job = updateJob(id, updates);
            if (!job) {
                return { success: false, error: 'Job not found' };
            }
            return { success: true, data: job };
        } catch (error) {
            console.error('Error updating job:', error);
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle('jobs:delete', async (_, id: string) => {
        try {
            const success = deleteJob(id);
            return { success, error: success ? undefined : 'Job not found' };
        } catch (error) {
            console.error('Error deleting job:', error);
            return { success: false, error: String(error) };
        }
    });

    // ==================== Interview Round Operations ====================

    ipcMain.handle(
        'rounds:add',
        async (_, jobId: string, round: Omit<InterviewRound, 'id'>) => {
            try {
                const newRound = addRound(jobId, round);
                return { success: true, data: newRound };
            } catch (error) {
                console.error('Error adding round:', error);
                return { success: false, error: String(error) };
            }
        }
    );

    ipcMain.handle(
        'rounds:update',
        async (_, roundId: string, updates: Partial<InterviewRound>) => {
            try {
                const round = updateRound(roundId, updates);
                if (!round) {
                    return { success: false, error: 'Round not found' };
                }
                return { success: true, data: round };
            } catch (error) {
                console.error('Error updating round:', error);
                return { success: false, error: String(error) };
            }
        }
    );

    ipcMain.handle('rounds:delete', async (_, roundId: string) => {
        try {
            const success = deleteRound(roundId);
            return { success, error: success ? undefined : 'Round not found' };
        } catch (error) {
            console.error('Error deleting round:', error);
            return { success: false, error: String(error) };
        }
    });

    // ==================== Attachment Operations ====================

    ipcMain.handle(
        'attachments:save',
        async (
            _,
            jobId: string,
            fileData: ArrayBuffer,
            fileName: string,
            mimeType: string
        ) => {
            try {
                // Save file to disk
                const buffer = Buffer.from(fileData);
                const storedFile = saveFile(buffer, fileName, mimeType);

                // Create attachment metadata
                const attachment = createAttachmentMetadata(storedFile, buffer.length);

                // Add to job
                addAttachment(jobId, attachment);

                return { success: true, data: attachment };
            } catch (error) {
                console.error('Error saving attachment:', error);
                return { success: false, error: String(error) };
            }
        }
    );

    ipcMain.handle('attachments:get', async (_, storageId: string) => {
        try {
            const result = getFile(storageId);
            if (!result) {
                return { success: false, error: 'File not found' };
            }
            // Convert Buffer to ArrayBuffer for IPC
            const arrayBuffer = result.data.buffer.slice(
                result.data.byteOffset,
                result.data.byteOffset + result.data.byteLength
            );
            return {
                success: true,
                data: {
                    data: arrayBuffer,
                    metadata: result.metadata,
                },
            };
        } catch (error) {
            console.error('Error getting attachment:', error);
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle('attachments:delete', async (_, attachmentId: string) => {
        try {
            // Get storage ID before deleting attachment metadata
            const result = deleteAttachment(attachmentId);
            if (!result) {
                return { success: false, error: 'Attachment not found' };
            }

            // Delete actual file
            deleteFile(result.storageId);

            return { success: true };
        } catch (error) {
            console.error('Error deleting attachment:', error);
            return { success: false, error: String(error) };
        }
    });

    // ==================== Migration Operations ====================

    ipcMain.handle(
        'migration:importLegacyData',
        async (_, jobs: CreateJobDTO[]) => {
            try {
                const imported: string[] = [];
                for (const job of jobs) {
                    const created = createJob(job);
                    imported.push(created.id);
                }
                return { success: true, data: { importedCount: imported.length } };
            } catch (error) {
                console.error('Error importing legacy data:', error);
                return { success: false, error: String(error) };
            }
        }
    );

    ipcMain.handle('migration:checkExistingData', async () => {
        try {
            const jobs = getAllJobs();
            return { success: true, data: { hasData: jobs.length > 0, count: jobs.length } };
        } catch (error) {
            console.error('Error checking existing data:', error);
            return { success: false, error: String(error) };
        }
    });

    console.log('IPC handlers registered successfully');
}
