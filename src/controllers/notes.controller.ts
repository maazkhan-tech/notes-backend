import type { Request, Response, NextFunction } from "express";
import * as notesService from "../services/notes.service.js";
import { AppError } from "../errors/AppError.js";

// Controller functions for handling note-related requests

// GET /notes - Retrieve all notes
export async function getAllNotes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { tag } = req.query;
  if (tag !== undefined && typeof tag !== "string") {
    return next(new AppError(400, "tag must be a single string value"));
  }
  const notes = await notesService.getNotes(tag); // ← await
  res.status(200).json({ success: true, data: notes });
}
// GET /notes/:id - Retrieve a note by ID
export async function getNoteById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return next(new AppError(400, "ID must be a number"));
  }
  const note = notesService.getNoteById(id);
  if (!note) {
    return next(new AppError(404, "Note not found"));
  }
  res.status(200).json({ success: true, data: note });
}

// POST /notes - Create a new note
export async function createNote(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validationResult = notesService.validateCreateInput(req.body);
  if (!validationResult.valid) {
    return next(new AppError(400, validationResult.message));
  }

  const { title, content, tag } = req.body;
  const newNote = notesService.createNote({ title, content, tag });

  res.status(201).json({ success: true, data: newNote });
}

// PATCH /notes/:id - Update an existing note
export async function updateNote(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return next(new AppError(400, "ID must be a number"));
  }

  const validationResult = notesService.validateUpdateInput(req.body);

  if (!validationResult.valid) {
    return next(new AppError(400, validationResult.message));
  }

  // Only pass the allowed update fields to the service
  const { title, content, tag } = req.body;

  const updatedNote = notesService.updateNote(id, {
    title,
    content,
    tag,
  });

  if (!updatedNote) {
    return next(new AppError(404, "Note not found"));
  }

  res.status(200).json({ success: true, data: updatedNote });
}

// DELETE /notes/:id - Delete a note by ID
export async function deleteNote(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return next(new AppError(400, "ID must be a number"));
  }

  const deleted = notesService.deleteNote(id);
  if (!deleted) {
    return next(new AppError(404, "Note not found"));
  }

  res.status(204).send();
}
