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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabasePath = getDatabasePath;
exports.getAttachmentsDir = getAttachmentsDir;
exports.initDatabase = initDatabase;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
exports.withTransaction = withTransaction;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const electron_1 = require("electron");
let db = null;
/**
 * Get the database file path in user data directory
 */
function getDatabasePath() {
    const userDataPath = electron_1.app.getPath('userData');
    return path.join(userDataPath, 'job-tracker.db');
}
/**
 * Get the attachments directory path
 */
function getAttachmentsDir() {
    const userDataPath = electron_1.app.getPath('userData');
    const attachmentsDir = path.join(userDataPath, 'attachments');
    if (!fs.existsSync(attachmentsDir)) {
        fs.mkdirSync(attachmentsDir, { recursive: true });
    }
    return attachmentsDir;
}
/**
 * Initialize the database connection and create schema
 */
function initDatabase() {
    if (db)
        return db;
    const dbPath = getDatabasePath();
    console.log('Initializing database at:', dbPath);
    // Create database connection
    db = new better_sqlite3_1.default(dbPath);
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    // Enable WAL mode for better concurrent access
    db.pragma('journal_mode = WAL');
    // Try to read schema file, with fallback to inline schema
    let schema;
    // Try multiple paths for schema file
    const possiblePaths = [
        path.join(__dirname, 'database', 'schema.sql'), // Development
        path.join(__dirname, '..', 'electron', 'database', 'schema.sql'), // Alt dev
        path.join(process.resourcesPath || '', 'database', 'schema.sql'), // Production
        path.join(electron_1.app.getAppPath(), 'electron', 'database', 'schema.sql'), // Alt production
    ];
    let schemaPath = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            schemaPath = p;
            break;
        }
    }
    if (schemaPath) {
        schema = fs.readFileSync(schemaPath, 'utf-8');
        console.log('Loaded schema from:', schemaPath);
    }
    else {
        console.log('Using inline schema');
        schema = getInlineSchema();
    }
    // Execute the entire schema at once - SQLite handles multiple statements
    try {
        db.exec(schema);
        console.log('Schema executed successfully');
    }
    catch (error) {
        // Schema might already exist, which is fine
        console.log('Schema execution note:', error);
    }
    // Record migration if not exists - wrap in try-catch in case table doesn't exist yet
    try {
        const migrationCheck = db
            .prepare('SELECT COUNT(*) as count FROM migrations WHERE version = 1')
            .get();
        if (migrationCheck.count === 0) {
            db.prepare('INSERT INTO migrations (version, applied_at) VALUES (?, ?)').run(1, new Date().toISOString());
        }
    }
    catch (error) {
        // If migrations table doesn't exist, create it and insert
        console.log('Creating migrations table...');
        db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL UNIQUE,
        applied_at TEXT NOT NULL
      )
    `);
        db.prepare('INSERT OR IGNORE INTO migrations (version, applied_at) VALUES (?, ?)').run(1, new Date().toISOString());
    }
    console.log('Database initialized successfully');
    return db;
}
/**
 * Get the database instance
 */
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}
/**
 * Close the database connection
 */
function closeDatabase() {
    if (db) {
        db.close();
        db = null;
        console.log('Database connection closed');
    }
}
/**
 * Run a function within a transaction
 */
function withTransaction(fn) {
    const database = getDatabase();
    return database.transaction(fn)();
}
/**
 * Inline schema fallback when schema.sql file is not found
 */
function getInlineSchema() {
    return `
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS job_applications (
        id TEXT PRIMARY KEY,
        company TEXT NOT NULL,
        position TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected')),
        date_applied TEXT NOT NULL,
        salary TEXT,
        location TEXT,
        job_url TEXT,
        description TEXT,
        rejection_reason TEXT,
        rejection_stage TEXT CHECK(rejection_stage IN ('Shortlisting', 'Online Assessment', 'Technical Interview', 'HR Interview') OR rejection_stage IS NULL),
        learnings TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS interview_rounds (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('Screening', 'Technical', 'System Design', 'Behavioral', 'HR', 'Other')),
        date TEXT NOT NULL,
        notes TEXT DEFAULT '',
        completed INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (job_id) REFERENCES job_applications(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        round_id TEXT NOT NULL,
        text TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (round_id) REFERENCES interview_rounds(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        storage_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER NOT NULL,
        uploaded_at TEXT NOT NULL,
        FOREIGN KEY (job_id) REFERENCES job_applications(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attachment_files (
        storage_id TEXT PRIMARY KEY,
        file_path TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
    CREATE INDEX IF NOT EXISTS idx_interview_rounds_job_id ON interview_rounds(job_id);
    CREATE INDEX IF NOT EXISTS idx_todos_round_id ON todos(round_id);
    CREATE INDEX IF NOT EXISTS idx_attachments_job_id ON attachments(job_id);

    CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL UNIQUE,
        applied_at TEXT NOT NULL
    );
  `;
}
//# sourceMappingURL=database.js.map