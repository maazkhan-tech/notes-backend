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
  const tag = req.query.tag as string | undefined;
  if (tag && typeof tag !== "string") {
    return next(new AppError(400, "Tag must be a string"));
  }
  const filteredNotes = notesService.getNotes(tag);
  res.status(200).json(filteredNotes);
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

// Patch /notes/:id - Update an existing note
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
  const updatedNote = notesService.updateNote({ id, ...req.body });
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
  res.status(204).json({ success: true, message: "Note deleted successfully" });
}
