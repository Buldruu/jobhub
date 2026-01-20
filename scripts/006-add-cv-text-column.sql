-- Add cv_text column for manual CV entry
ALTER TABLE job_seeker_listings ADD COLUMN IF NOT EXISTS cv_text TEXT;
