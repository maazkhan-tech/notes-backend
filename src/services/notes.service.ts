import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  ValidationResult,
} from "../types/index.js";
import { query } from "../db/index.js";

// Validation functions for note inputs

export function validateCreateInput(input: unknown): ValidationResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {
      valid: false,
      message: "Request body must be a JSON object",
    };
  }

  const body = input as Record<string, unknown>;

  if (typeof body.title !== "string" || body.title.trim().length === 0) {
    return {
      valid: false,
      message: "title is required and must be a non-empty string",
    };
  }

  if (typeof body.content !== "string" || body.content.trim().length === 0) {
    return {
      valid: false,
      message: "content must be a non-empty string",
    };
  }

  if (
    body.tag !== undefined &&
    (typeof body.tag !== "string" || body.tag.trim().length === 0)
  ) {
    return {
      valid: false,
      message: "tag must be a non-empty string",
    };
  }

  return { valid: true };
}

export function validateUpdateInput(input: unknown): ValidationResult {
  if (typeof input !== "object" || input === null) {
    return { valid: false, message: "Request body must be a JSON object" };
  }

  const body = input as Record<string, unknown>;

  const hasTitle = body.title !== undefined;
  const hasContent = body.content !== undefined;
  const hasTag = body.tag !== undefined;
  // Validate title
  if (!hasTitle && !hasContent && !hasTag) {
    return { valid: false, message: "Provide at least one field to update" };
  }

  // Validate each field if provided

  if (
    hasTitle &&
    (typeof body.title !== "string" || body.title.trim().length === 0)
  ) {
    return { valid: false, message: "title must be a non-empty string" };
  }

  if (
    hasContent &&
    (typeof body.content !== "string" || body.content.trim().length === 0)
  ) {
    return { valid: false, message: "content must be a non-empty string" };
  }
  if (
    hasTag &&
    body.tag !== null &&
    (typeof body.tag !== "string" || body.tag.trim().length === 0)
  ) {
    return {
      valid: false,
      message: "tag must be a non-empty string or null to clear it",
    };
  }

  return { valid: true };
}

// function to get notes

export async function getNotes(tag?: string): Promise<Note[]> {
  if (tag) {
    const result = await query<Note>(
      `SELECT id, title, content, tag,
              created_at AS "createdAt",
              updated_at AS "updatedAt"
       FROM notes
       WHERE tag = $1
       ORDER BY created_at DESC`,
      [tag],
    );
    return result.rows;
  }

  const result = await query<Note>(
    `SELECT id, title, content, tag,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
     FROM notes
     ORDER BY created_at DESC`,
  );
  return result.rows;
}

// function to get note by id
export async function getNoteById(id: number): Promise<Note | undefined> {
  const result = await query<Note>(
    `SELECT id, title, content, tag,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
     FROM notes
     WHERE id = $1`,
    [id],
  );
  return result.rows[0];
}

// function to create note
export async function createNote(input: CreateNoteInput): Promise<Note> {
  const result = await query<Note>(
    `INSERT INTO notes (title, content, tag)
     VALUES ($1, $2, $3)
     RETURNING id, title, content, tag,
               created_at AS "createdAt",
               updated_at AS "updatedAt"`,
    [input.title, input.content, input.tag ?? null],
  );
  const note = result.rows[0];
  if (!note) {
    throw new Error("Failed to create note");
  }
  return note;
}

// function to update note

export async function updateNote(
  id: number,
  updates: UpdateNoteInput,
): Promise<Note | undefined> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(updates.title);
  }

  if (updates.content !== undefined) {
    fields.push(`content = $${paramIndex++}`);
    values.push(updates.content);
  }

  if (updates.tag !== undefined) {
    fields.push(`tag = $${paramIndex++}`);
    values.push(updates.tag === null ? null : updates.tag.toLowerCase());
  }

  // Always update updated_at
  fields.push(`updated_at = NOW()`);

  // id goes last as the WHERE parameter
  values.push(id);

  const result = await query<Note>(
    `UPDATE notes
     SET ${fields.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING id, title, content, tag,
               created_at AS "createdAt",
               updated_at AS "updatedAt"`,
    values,
  );

  return result.rows[0]; // undefined if id not found
}
// function to delete note
export async function deleteNote(id: number): Promise<boolean> {
  const result = await query("DELETE FROM notes WHERE id = $1", [id]);
  return (result.rowCount ?? 0) === 1;
}
