// Legacy data migration utility
// Migrates data from localStorage and IndexedDB to SQLite

import { getAllFilesFromIndexedDB } from './fileStorage';
import type { JobApplication, InterviewRound, Attachment } from '../../shared/types';

const LEGACY_STORAGE_KEY = 'job-application-tracker-data';
const MIGRATION_COMPLETE_KEY = 'sqlite-migration-complete';

// Check if we're in Electron environment
const isElectron = (): boolean => {
    return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

/**
 * Check if migration has already been completed
 */
export const isMigrationComplete = (): boolean => {
    return localStorage.getItem(MIGRATION_COMPLETE_KEY) === 'true';
};

/**
 * Check if there is legacy data to migrate
 */
export const hasLegacyData = (): boolean => {
    const saved = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!saved) return false;

    try {
        const jobs = JSON.parse(saved);
        return Array.isArray(jobs) && jobs.length > 0;
    } catch {
        return false;
    }
};

/**
 * Get legacy jobs from localStorage
 */
export const getLegacyJobs = (): JobApplication[] => {
    const saved = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!saved) return [];

    try {
        return JSON.parse(saved);
    } catch {
        return [];
    }
};

/**
 * Migrate all legacy data to SQLite
 * Returns the number of jobs migrated
 */
export const migrateLegacyData = async (): Promise<{
    success: boolean;
    jobsImported: number;
    error?: string;
}> => {
    if (!isElectron()) {
        return {
            success: false,
            jobsImported: 0,
            error: 'Electron API not available',
        };
    }

    if (isMigrationComplete()) {
        return {
            success: true,
            jobsImported: 0,
            error: 'Migration already completed',
        };
    }

    try {
        // Check if SQLite already has data
        const existingDataResult = await window.electronAPI.migration.checkExistingData();
        if (existingDataResult.success && existingDataResult.data?.hasData) {
            // Mark migration as complete if there's already data
            localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
            return {
                success: true,
                jobsImported: 0,
                error: 'Database already has data',
            };
        }

        // Get legacy jobs from localStorage
        const legacyJobs = getLegacyJobs();
        if (legacyJobs.length === 0) {
            localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
            return {
                success: true,
                jobsImported: 0,
            };
        }

        // Prepare jobs for import (convert to CreateJobDTO format)
        const jobsToImport = legacyJobs.map((job) => ({
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
            rounds: job.rounds?.map((round: InterviewRound) => ({
                type: round.type,
                date: round.date,
                notes: round.notes,
                todos: round.todos,
                completed: round.completed,
            })),
            // Note: Attachments need special handling - we migrate the metadata
            // The actual files in IndexedDB would need separate migration
            attachments: job.attachments?.map((att: Attachment) => ({
                id: att.id,
                storageId: att.storageId,
                name: att.name,
                type: att.type,
                size: att.size,
                uploadedAt: att.uploadedAt,
            })),
        }));

        // Import jobs to SQLite
        const result = await window.electronAPI.migration.importLegacyData(jobsToImport);

        if (result.success) {
            // Mark migration as complete
            localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');

            // Optionally clear legacy data after successful migration
            // Uncomment to remove old data:
            // localStorage.removeItem(LEGACY_STORAGE_KEY);

            return {
                success: true,
                jobsImported: result.data?.importedCount || 0,
            };
        } else {
            return {
                success: false,
                jobsImported: 0,
                error: result.error || 'Failed to import data',
            };
        }
    } catch (error) {
        console.error('Migration error:', error);
        return {
            success: false,
            jobsImported: 0,
            error: String(error),
        };
    }
};

/**
 * Migrate IndexedDB attachments to SQLite
 * This is a more complex operation that needs to move actual file data
 */
export const migrateAttachments = async (
    jobAttachmentMap: Map<string, Attachment[]>
): Promise<{
    success: boolean;
    filesImported: number;
    error?: string;
}> => {
    if (!isElectron()) {
        return {
            success: false,
            filesImported: 0,
            error: 'Electron API not available',
        };
    }

    try {
        // Get all files from IndexedDB
        const files = await getAllFilesFromIndexedDB();
        let imported = 0;

        for (const storedFile of files) {
            // Find which job this file belongs to
            let jobId: string | null = null;
            for (const [jId, attachments] of jobAttachmentMap.entries()) {
                if (attachments.some((a) => a.storageId === storedFile.id)) {
                    jobId = jId;
                    break;
                }
            }

            if (jobId) {
                // Convert Blob to ArrayBuffer
                const arrayBuffer = await storedFile.data.arrayBuffer();

                // Save to SQLite
                await window.electronAPI.attachments.save(
                    jobId,
                    arrayBuffer,
                    storedFile.name,
                    storedFile.type
                );

                imported++;
            }
        }

        return {
            success: true,
            filesImported: imported,
        };
    } catch (error) {
        console.error('Attachment migration error:', error);
        return {
            success: false,
            filesImported: 0,
            error: String(error),
        };
    }
};
