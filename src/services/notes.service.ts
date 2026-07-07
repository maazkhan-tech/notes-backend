import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  ValidationResult,
} from "../types/index.js";
import fs from "fs";
import { config } from "../config/index.js";
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

// File operations for notes

const notesFilePath = config.noteFile;

export function readNotesFromFile(): Note[] {
  try {
    if (!fs.existsSync(notesFilePath)) {
      return [];
    }
    const data = fs.readFileSync(notesFilePath, "utf-8");
    if (!data.trim()) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading notes from file:", error);
    return [];
  }
}

// function to write notes to file
export function writeNotesToFile(notes: Note[]): void {
  fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), "utf-8");
}

// function to get notes

export async function getNotes(tag?: string): Promise<Note[]> {
  if (tag) {
    const result = await query<Note>("SELECT * FROM notes WHERE tag = $1", [
      tag,
    ]);
    return result.rows;
  }

  const result = await query<Note>(
    "SELECT * FROM notes ORDER BY created_at DESC",
  );
  return result.rows;
}

// function to get note by id
export function getNoteById(id: number): Note | undefined {
  const notes = readNotesFromFile();
  return notes.find((note) => note.id === id);
}

// function to create note
export function createNote(input: CreateNoteInput): Note {
  const notes = readNotesFromFile();
  const id =
    notes.length > 0 ? Math.max(...notes.map((note) => note.id)) + 1 : 1;
  const newNote: Note = {
    id,
    title: input.title,
    content: input.content,
    tag: input.tag?.toLowerCase(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  notes.push(newNote);
  writeNotesToFile(notes);
  return newNote;
}

// function to update note

export function updateNote(
  id: number,
  updates: UpdateNoteInput,
): Note | undefined {
  const notes = readNotesFromFile();
  const note = notes.find((note) => note.id === id);
  if (!note) {
    return undefined; // Note not found
  }

  if (updates.title !== undefined) {
    note.title = updates.title;
  }
  if (updates.content !== undefined) {
    note.content = updates.content;
  }
  if (updates.tag !== undefined) {
    note.tag = updates.tag === null ? undefined : updates.tag.toLowerCase();
  }

  note.updatedAt = new Date();
  writeNotesToFile(notes);
  return note;
}

// function to delete note
export function deleteNote(id: number): boolean {
  const notes = readNotesFromFile();
  const newNotes = notes.filter((note) => note.id !== id);
  if (newNotes.length === notes.length) {
    return false; // Note not found
  }
  writeNotesToFile(newNotes);
  return true; // Note deleted
}
