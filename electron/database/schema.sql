-- SQLite Schema for Job Application Tracker
-- Version 1.0

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Job Applications table
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

-- Interview Rounds table
CREATE TABLE IF NOT EXISTS interview_rounds (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Screening', 'Technical', 'System Design', 'Behavioral', 'HR', 'Other')),
    date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    completed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (job_id) REFERENCES job_applications(id) ON DELETE CASCADE
);

-- Todos table (for interview rounds)
CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    round_id TEXT NOT NULL,
    text TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (round_id) REFERENCES interview_rounds(id) ON DELETE CASCADE
);

-- Attachments metadata table
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

-- Attachment files table (tracks file paths on disk)
CREATE TABLE IF NOT EXISTS attachment_files (
    storage_id TEXT PRIMARY KEY,
    file_path TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_interview_rounds_job_id ON interview_rounds(job_id);
CREATE INDEX IF NOT EXISTS idx_todos_round_id ON todos(round_id);
CREATE INDEX IF NOT EXISTS idx_attachments_job_id ON attachments(job_id);

-- Migration tracking table
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version INTEGER NOT NULL UNIQUE,
    applied_at TEXT NOT NULL
);
