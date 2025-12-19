"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFile = saveFile;
exports.getFile = getFile;
exports.deleteFile = deleteFile;
exports.createAttachmentMetadata = createAttachmentMetadata;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const database_1 = require("../database");
/**
 * Save a file to the attachments directory and record in database
 */
function saveFile(fileData, originalName, mimeType) {
    const db = (0, database_1.getDatabase)();
    const storageId = crypto.randomUUID();
    const attachmentsDir = (0, database_1.getAttachmentsDir)();
    // Create unique filename with original extension
    const ext = path.extname(originalName);
    const fileName = `${storageId}${ext}`;
    const filePath = path.join(attachmentsDir, fileName);
    // Write file to disk
    fs.writeFileSync(filePath, fileData);
    const createdAt = new Date().toISOString();
    // Record in database
    db.prepare(`INSERT INTO attachment_files (storage_id, file_path, original_name, mime_type, created_at)
     VALUES (?, ?, ?, ?, ?)`).run(storageId, filePath, originalName, mimeType, createdAt);
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
function getFile(storageId) {
    const db = (0, database_1.getDatabase)();
    const row = db
        .prepare('SELECT * FROM attachment_files WHERE storage_id = ?')
        .get(storageId);
    if (!row)
        return null;
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
function deleteFile(storageId) {
    const db = (0, database_1.getDatabase)();
    const row = db
        .prepare('SELECT file_path FROM attachment_files WHERE storage_id = ?')
        .get(storageId);
    if (!row)
        return false;
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
function createAttachmentMetadata(storedFile, fileSize) {
    return {
        id: crypto.randomUUID(),
        storageId: storedFile.storageId,
        name: storedFile.originalName,
        type: storedFile.mimeType,
        size: fileSize,
        uploadedAt: storedFile.createdAt,
    };
}
//# sourceMappingURL=fileRepository.js.map