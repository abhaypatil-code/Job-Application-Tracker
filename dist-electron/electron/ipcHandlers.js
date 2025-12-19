"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpcHandlers = registerIpcHandlers;
const electron_1 = require("electron");
const jobRepository_1 = require("./database/repositories/jobRepository");
const fileRepository_1 = require("./database/repositories/fileRepository");
/**
 * Register all IPC handlers for database operations
 */
function registerIpcHandlers() {
    // ==================== Job Operations ====================
    electron_1.ipcMain.handle('jobs:getAll', async () => {
        try {
            return { success: true, data: (0, jobRepository_1.getAllJobs)() };
        }
        catch (error) {
            console.error('Error getting all jobs:', error);
            return { success: false, error: String(error) };
        }
    });
    electron_1.ipcMain.handle('jobs:getById', async (_, id) => {
        try {
            const job = (0, jobRepository_1.getJobById)(id);
            if (!job) {
                return { success: false, error: 'Job not found' };
            }
            return { success: true, data: job };
        }
        catch (error) {
            console.error('Error getting job by id:', error);
            return { success: false, error: String(error) };
        }
    });
    electron_1.ipcMain.handle('jobs:create', async (_, dto) => {
        try {
            const job = (0, jobRepository_1.createJob)(dto);
            return { success: true, data: job };
        }
        catch (error) {
            console.error('Error creating job:', error);
            return { success: false, error: String(error) };
        }
    });
    electron_1.ipcMain.handle('jobs:update', async (_, id, updates) => {
        try {
            const job = (0, jobRepository_1.updateJob)(id, updates);
            if (!job) {
                return { success: false, error: 'Job not found' };
            }
            return { success: true, data: job };
        }
        catch (error) {
            console.error('Error updating job:', error);
            return { success: false, error: String(error) };
        }
    });
    electron_1.ipcMain.handle('jobs:delete', async (_, id) => {
        try {
            const success = (0, jobRepository_1.deleteJob)(id);
            return { success, error: success ? undefined : 'Job not found' };
        }
        catch (error) {
            console.error('Error deleting job:', error);
            return { success: false, error: String(error) };
        }
    });
    // ==================== Interview Round Operations ====================
    electron_1.ipcMain.handle('rounds:add', async (_, jobId, round) => {
        try {
            const newRound = (0, jobRepository_1.addRound)(jobId, round);
            return { success: true, data: newRound };
        }
        catch (error) {
            console.error('Error adding round:', error);
            return { success: false, error: String(error) };
        }
    });
    electron_1.ipcMain.handle('rounds:update', async (_, roundId, updates) => {
        try {
            const round = (0, jobRepository_1.updateRound)(roundId, updates);
            if (!round) {
                return { success: false, error: 'Round not found' };
            }
            return { success: true, data: round };
        }
        catch (error) {
            console.error('Error updating round:', error);
            return { success: false, error: String(error) };
        }
    });
    electron_1.ipcMain.handle('rounds:delete', async (_, roundId) => {
        try {
            const success = (0, jobRepository_1.deleteRound)(roundId);
            return { success, error: success ? undefined : 'Round not found' };
        }
        catch (error) {
            console.error('Error deleting round:', error);
            return { success: false, error: String(error) };
        }
    });
    // ==================== Attachment Operations ====================
    electron_1.ipcMain.handle('attachments:save', async (_, jobId, fileData, fileName, mimeType) => {
        try {
            // Save file to disk
            const buffer = Buffer.from(fileData);
            const storedFile = (0, fileRepository_1.saveFile)(buffer, fileName, mimeType);
            // Create attachment metadata
            const attachment = (0, fileRepository_1.createAttachmentMetadata)(storedFile, buffer.length);
            // Add to job
            (0, jobRepository_1.addAttachment)(jobId, attachment);
            return { success: true, data: attachment };
        }
        catch (error) {
            console.error('Error saving attachment:', error);
            return { success: false, error: String(error) };
        }
    });
    electron_1.ipcMain.handle('attachments:get', async (_, storageId) => {
        try {
            const result = (0, fileRepository_1.getFile)(storageId);
            if (!result) {
                return { success: false, error: 'File not found' };
            }
            // Convert Buffer to ArrayBuffer for IPC
            const arrayBuffer = result.data.buffer.slice(result.data.byteOffset, result.data.byteOffset + result.data.byteLength);
            return {
                success: true,
                data: {
                    data: arrayBuffer,
                    metadata: result.metadata,
                },
            };
        }
        catch (error) {
            console.error('Error getting attachment:', error);
            return { success: false, error: String(error) };
        }
    });
    electron_1.ipcMain.handle('attachments:delete', async (_, attachmentId) => {
        try {
            // Get storage ID before deleting attachment metadata
            const result = (0, jobRepository_1.deleteAttachment)(attachmentId);
            if (!result) {
                return { success: false, error: 'Attachment not found' };
            }
            // Delete actual file
            (0, fileRepository_1.deleteFile)(result.storageId);
            return { success: true };
        }
        catch (error) {
            console.error('Error deleting attachment:', error);
            return { success: false, error: String(error) };
        }
    });
    // ==================== Migration Operations ====================
    electron_1.ipcMain.handle('migration:importLegacyData', async (_, jobs) => {
        try {
            const imported = [];
            for (const job of jobs) {
                const created = (0, jobRepository_1.createJob)(job);
                imported.push(created.id);
            }
            return { success: true, data: { importedCount: imported.length } };
        }
        catch (error) {
            console.error('Error importing legacy data:', error);
            return { success: false, error: String(error) };
        }
    });
    electron_1.ipcMain.handle('migration:checkExistingData', async () => {
        try {
            const jobs = (0, jobRepository_1.getAllJobs)();
            return { success: true, data: { hasData: jobs.length > 0, count: jobs.length } };
        }
        catch (error) {
            console.error('Error checking existing data:', error);
            return { success: false, error: String(error) };
        }
    });
    console.log('IPC handlers registered successfully');
}
//# sourceMappingURL=ipcHandlers.js.map