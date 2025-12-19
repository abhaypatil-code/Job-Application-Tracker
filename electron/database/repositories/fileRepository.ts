import * as path from 'path';
import * as fs from 'fs';
import { getDatabase, getAttachmentsDir } from '../database';
import type { Attachment } from '../../../shared/types';

export interface StoredFile {
    storageId: string;
    filePath: string;
    originalName: string;
    mimeType: string;
    createdAt: string;
}

/**
 * Save a file to the attachments directory and record in database
 */
export function saveFile(
    fileData: Buffer,
    originalName: string,
    mimeType: string
): StoredFile {
    const db = getDatabase();
    const storageId = crypto.randomUUID();
    const attachmentsDir = getAttachmentsDir();

    // Create unique filename with original extension
    const ext = path.extname(originalName);
    const fileName = `${storageId}${ext}`;
    const filePath = path.join(attachmentsDir, fileName);

    // Write file to disk
    fs.writeFileSync(filePath, fileData);

    const createdAt = new Date().toISOString();

    // Record in database
    db.prepare(
        `INSERT INTO attachment_files (storage_id, file_path, original_name, mime_type, created_at)
     VALUES (?, ?, ?, ?, ?)`
    ).run(storageId, filePath, originalName, mimeType, createdAt);

    return {
        storageId,
        filePath,
        originalName,
        mimeType,
        createdAt,
    };
}

/**
 * Get file data by storage ID
 */
export function getFile(storageId: string): { data: Buffer; metadata: StoredFile } | null {
    const db = getDatabase();

    const row = db
        .prepare('SELECT * FROM attachment_files WHERE storage_id = ?')
        .get(storageId) as {
            storage_id: string;
            file_path: string;
            original_name: string;
            mime_type: string;
            created_at: string;
        } | undefined;

    if (!row) return null;

    // Check if file exists
    if (!fs.existsSync(row.file_path)) {
        console.error('File not found on disk:', row.file_path);
        return null;
    }

    const data = fs.readFileSync(row.file_path);

    return {
        data,
        metadata: {
            storageId: row.storage_id,
            filePath: row.file_path,
            originalName: row.original_name,
            mimeType: row.mime_type,
            createdAt: row.created_at,
        },
    };
}

/**
 * Delete a file from disk and database
 */
export function deleteFile(storageId: string): boolean {
    const db = getDatabase();

    const row = db
        .prepare('SELECT file_path FROM attachment_files WHERE storage_id = ?')
        .get(storageId) as { file_path: string } | undefined;

    if (!row) return false;

    // Delete from disk if exists
    if (fs.existsSync(row.file_path)) {
        fs.unlinkSync(row.file_path);
    }

    // Delete from database
    db.prepare('DELETE FROM attachment_files WHERE storage_id = ?').run(storageId);

    return true;
}

/**
 * Create Attachment metadata for a stored file
 */
export function createAttachmentMetadata(
    storedFile: StoredFile,
    fileSize: number
): Attachment {
    return {
        id: crypto.randomUUID(),
        storageId: storedFile.storageId,
        name: storedFile.originalName,
        type: storedFile.mimeType,
        size: fileSize,
        uploadedAt: storedFile.createdAt,
    };
}
