import { getDatabase, withTransaction } from '../database';
import type Database from 'better-sqlite3';

import {
    type JobApplication,
    type InterviewRound,
    type Attachment,
    type Todo,
    type CreateJobDTO,
    type UpdateJobDTO,
} from '../../../shared/types';

export interface JobApplicationRow {
    id: string;
    company: string;
    position: string;
    status: string;
    date_applied: string;
    salary: string | null;
    location: string | null;
    job_url: string | null;
    description: string | null;
    rejection_reason: string | null;
    rejection_stage: string | null;
    learnings: string | null;
    created_at: string;
    updated_at: string;
}

export interface InterviewRoundRow {
    id: string;
    job_id: string;
    type: string;
    date: string;
    notes: string;
    completed: number;
}

export interface TodoRow {
    id: string;
    round_id: string;
    text: string;
    completed: number;
}

export interface AttachmentRow {
    id: string;
    job_id: string;
    storage_id: string;
    name: string;
    type: string;
    size: number;
    uploaded_at: string;
}

// Repository functions

// Repository functions

function rowToJobApplication(
    row: JobApplicationRow,
    rounds: InterviewRound[],
    attachments: Attachment[]
): JobApplication {
    return {
        id: row.id,
        company: row.company,
        position: row.position,
        status: row.status as JobApplication['status'],
        dateApplied: row.date_applied,
        salary: row.salary || undefined,
        location: row.location || undefined,
        jobUrl: row.job_url || undefined,
        description: row.description || undefined,
        rounds,
        rejectionReason: row.rejection_reason || undefined,
        rejectionStage: row.rejection_stage as JobApplication['rejectionStage'],
        learnings: row.learnings || undefined,
        attachments,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function getTodosForRound(db: Database.Database, roundId: string): Todo[] {
    const rows = db
        .prepare('SELECT * FROM todos WHERE round_id = ?')
        .all(roundId) as TodoRow[];
    return rows.map((row) => ({
        id: row.id,
        text: row.text,
        completed: row.completed === 1,
    }));
}

function getRoundsForJob(db: Database.Database, jobId: string): InterviewRound[] {
    const rows = db
        .prepare('SELECT * FROM interview_rounds WHERE job_id = ? ORDER BY date')
        .all(jobId) as InterviewRoundRow[];
    return rows.map((row) => ({
        id: row.id,
        type: row.type as InterviewRound['type'],
        date: row.date,
        notes: row.notes,
        todos: getTodosForRound(db, row.id),
        completed: row.completed === 1,
    }));
}

function getAttachmentsForJob(db: Database.Database, jobId: string): Attachment[] {
    const rows = db
        .prepare('SELECT * FROM attachments WHERE job_id = ? ORDER BY uploaded_at')
        .all(jobId) as AttachmentRow[];
    return rows.map((row) => ({
        id: row.id,
        storageId: row.storage_id,
        name: row.name,
        type: row.type,
        size: row.size,
        uploadedAt: row.uploaded_at,
    }));
}

export function getAllJobs(): JobApplication[] {
    const db = getDatabase();
    const rows = db
        .prepare('SELECT * FROM job_applications ORDER BY updated_at DESC')
        .all() as JobApplicationRow[];

    return rows.map((row) => {
        const rounds = getRoundsForJob(db, row.id);
        const attachments = getAttachmentsForJob(db, row.id);
        return rowToJobApplication(row, rounds, attachments);
    });
}

export function getJobById(id: string): JobApplication | null {
    const db = getDatabase();
    const row = db
        .prepare('SELECT * FROM job_applications WHERE id = ?')
        .get(id) as JobApplicationRow | undefined;

    if (!row) return null;

    const rounds = getRoundsForJob(db, row.id);
    const attachments = getAttachmentsForJob(db, row.id);
    return rowToJobApplication(row, rounds, attachments);
}

export function createJob(dto: CreateJobDTO): JobApplication {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    return withTransaction(() => {
        db.prepare(
            `INSERT INTO job_applications 
       (id, company, position, status, date_applied, salary, location, job_url, description, rejection_reason, rejection_stage, learnings, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
            id,
            dto.company,
            dto.position,
            dto.status,
            dto.dateApplied,
            dto.salary || null,
            dto.location || null,
            dto.jobUrl || null,
            dto.description || null,
            dto.rejectionReason || null,
            dto.rejectionStage || null,
            dto.learnings || null,
            now,
            now
        );

        // Insert rounds if provided
        if (dto.rounds && dto.rounds.length > 0) {
            for (const round of dto.rounds) {
                const roundId = crypto.randomUUID();
                db.prepare(
                    `INSERT INTO interview_rounds (id, job_id, type, date, notes, completed)
           VALUES (?, ?, ?, ?, ?, ?)`
                ).run(roundId, id, round.type, round.date, round.notes, round.completed ? 1 : 0);

                // Insert todos for round
                if (round.todos && round.todos.length > 0) {
                    for (const todo of round.todos) {
                        const todoId = crypto.randomUUID();
                        db.prepare(
                            `INSERT INTO todos (id, round_id, text, completed)
               VALUES (?, ?, ?, ?)`
                        ).run(todoId, roundId, todo.text, todo.completed ? 1 : 0);
                    }
                }
            }
        }

        // Insert attachments if provided (metadata only, files handled separately)
        if (dto.attachments && dto.attachments.length > 0) {
            for (const attachment of dto.attachments) {
                db.prepare(
                    `INSERT INTO attachments (id, job_id, storage_id, name, type, size, uploaded_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
                ).run(
                    attachment.id,
                    id,
                    attachment.storageId,
                    attachment.name,
                    attachment.type,
                    attachment.size,
                    attachment.uploadedAt
                );
            }
        }

        return getJobById(id)!;
    });
}



export function updateJob(id: string, updates: UpdateJobDTO): JobApplication | null {
    const db = getDatabase();
    const existing = getJobById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: (string | null)[] = [];

    if (updates.company !== undefined) {
        fields.push('company = ?');
        values.push(updates.company);
    }
    if (updates.position !== undefined) {
        fields.push('position = ?');
        values.push(updates.position);
    }
    if (updates.status !== undefined) {
        fields.push('status = ?');
        values.push(updates.status);
    }
    if (updates.dateApplied !== undefined) {
        fields.push('date_applied = ?');
        values.push(updates.dateApplied);
    }
    if (updates.salary !== undefined) {
        fields.push('salary = ?');
        values.push(updates.salary || null);
    }
    if (updates.location !== undefined) {
        fields.push('location = ?');
        values.push(updates.location || null);
    }
    if (updates.jobUrl !== undefined) {
        fields.push('job_url = ?');
        values.push(updates.jobUrl || null);
    }
    if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description || null);
    }
    if (updates.rejectionReason !== undefined) {
        fields.push('rejection_reason = ?');
        values.push(updates.rejectionReason || null);
    }
    if (updates.rejectionStage !== undefined) {
        fields.push('rejection_stage = ?');
        values.push(updates.rejectionStage || null);
    }
    if (updates.learnings !== undefined) {
        fields.push('learnings = ?');
        values.push(updates.learnings || null);
    }

    if (fields.length > 0) {
        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        db.prepare(`UPDATE job_applications SET ${fields.join(', ')} WHERE id = ?`).run(
            ...values
        );
    }

    return getJobById(id);
}

export function deleteJob(id: string): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM job_applications WHERE id = ?').run(id);
    return result.changes > 0;
}

// Interview Round operations

export function addRound(
    jobId: string,
    round: Omit<InterviewRound, 'id'>
): InterviewRound {
    const db = getDatabase();
    const id = crypto.randomUUID();

    return withTransaction(() => {
        db.prepare(
            `INSERT INTO interview_rounds (id, job_id, type, date, notes, completed)
       VALUES (?, ?, ?, ?, ?, ?)`
        ).run(id, jobId, round.type, round.date, round.notes, round.completed ? 1 : 0);

        // Insert todos
        if (round.todos && round.todos.length > 0) {
            for (const todo of round.todos) {
                const todoId = crypto.randomUUID();
                db.prepare(
                    `INSERT INTO todos (id, round_id, text, completed)
           VALUES (?, ?, ?, ?)`
                ).run(todoId, id, todo.text, todo.completed ? 1 : 0);
            }
        }

        // Update job's updated_at
        db.prepare('UPDATE job_applications SET updated_at = ? WHERE id = ?').run(
            new Date().toISOString(),
            jobId
        );

        return {
            id,
            type: round.type,
            date: round.date,
            notes: round.notes,
            todos: getTodosForRound(db, id),
            completed: round.completed,
        };
    });
}

export function updateRound(
    roundId: string,
    updates: Partial<Omit<InterviewRound, 'id'>>
): InterviewRound | null {
    const db = getDatabase();

    const existing = db
        .prepare('SELECT * FROM interview_rounds WHERE id = ?')
        .get(roundId) as InterviewRoundRow | undefined;

    if (!existing) return null;

    return withTransaction(() => {
        const fields: string[] = [];
        const values: (string | number)[] = [];

        if (updates.type !== undefined) {
            fields.push('type = ?');
            values.push(updates.type);
        }
        if (updates.date !== undefined) {
            fields.push('date = ?');
            values.push(updates.date);
        }
        if (updates.notes !== undefined) {
            fields.push('notes = ?');
            values.push(updates.notes);
        }
        if (updates.completed !== undefined) {
            fields.push('completed = ?');
            values.push(updates.completed ? 1 : 0);
        }

        if (fields.length > 0) {
            values.push(roundId);
            db.prepare(`UPDATE interview_rounds SET ${fields.join(', ')} WHERE id = ?`).run(
                ...values
            );
        }

        // Sync todos if provided
        if (updates.todos !== undefined) {
            // Delete existing todos for this round
            db.prepare('DELETE FROM todos WHERE round_id = ?').run(roundId);

            // Insert new todos
            if (updates.todos.length > 0) {
                const insertTodo = db.prepare(
                    `INSERT INTO todos (id, round_id, text, completed) VALUES (?, ?, ?, ?)`
                );
                for (const todo of updates.todos) {
                    // Use existing todo id or generate new one
                    const todoId = todo.id || crypto.randomUUID();
                    insertTodo.run(todoId, roundId, todo.text, todo.completed ? 1 : 0);
                }
            }
        }

        // Update parent job's updated_at
        db.prepare('UPDATE job_applications SET updated_at = ? WHERE id = ?').run(
            new Date().toISOString(),
            existing.job_id
        );

        const updated = db
            .prepare('SELECT * FROM interview_rounds WHERE id = ?')
            .get(roundId) as InterviewRoundRow;

        return {
            id: updated.id,
            type: updated.type as InterviewRound['type'],
            date: updated.date,
            notes: updated.notes,
            todos: getTodosForRound(db, updated.id),
            completed: updated.completed === 1,
        };
    });
}

export function deleteRound(roundId: string): boolean {
    const db = getDatabase();

    // Get job_id before delete for updating timestamp
    const round = db
        .prepare('SELECT job_id FROM interview_rounds WHERE id = ?')
        .get(roundId) as { job_id: string } | undefined;

    if (!round) return false;

    const result = db.prepare('DELETE FROM interview_rounds WHERE id = ?').run(roundId);

    if (result.changes > 0) {
        db.prepare('UPDATE job_applications SET updated_at = ? WHERE id = ?').run(
            new Date().toISOString(),
            round.job_id
        );
        return true;
    }

    return false;
}

// Attachment operations

export function addAttachment(jobId: string, attachment: Attachment): Attachment {
    const db = getDatabase();

    db.prepare(
        `INSERT INTO attachments (id, job_id, storage_id, name, type, size, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
        attachment.id,
        jobId,
        attachment.storageId,
        attachment.name,
        attachment.type,
        attachment.size,
        attachment.uploadedAt
    );

    // Update job's updated_at
    db.prepare('UPDATE job_applications SET updated_at = ? WHERE id = ?').run(
        new Date().toISOString(),
        jobId
    );

    return attachment;
}

export function deleteAttachment(attachmentId: string): { storageId: string } | null {
    const db = getDatabase();

    const attachment = db
        .prepare('SELECT storage_id, job_id FROM attachments WHERE id = ?')
        .get(attachmentId) as { storage_id: string; job_id: string } | undefined;

    if (!attachment) return null;

    db.prepare('DELETE FROM attachments WHERE id = ?').run(attachmentId);

    // Update job's updated_at
    db.prepare('UPDATE job_applications SET updated_at = ? WHERE id = ?').run(
        new Date().toISOString(),
        attachment.job_id
    );

    return { storageId: attachment.storage_id };
}
