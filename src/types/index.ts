export interface Note {
  id: number;
  title: string;
  content: string;
  tag?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export type CreateNoteInput = Omit<Note, "id" | "createdAt" | "updatedAt">;

export type UpdateNoteInput = Partial<Omit<CreateNoteInput, "tag">> & {
  tag?: string | null;
};
