import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as NotesController from "../controllers/notes.controller.js";

const router = Router();
router.get("/", asyncHandler(NotesController.getAllNotes));
router.post("/", asyncHandler(NotesController.createNote));
router.get("/:id", asyncHandler(NotesController.getNoteById));
router.patch("/:id", asyncHandler(NotesController.updateNote));
router.delete("/:id", asyncHandler(NotesController.deleteNote));

export default router;
