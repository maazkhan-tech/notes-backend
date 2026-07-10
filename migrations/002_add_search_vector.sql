-- migrations/002_add_search_vector.sql
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('english', title || ' ' || content)
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_notes_search
  ON notes USING GIN(search_vector);