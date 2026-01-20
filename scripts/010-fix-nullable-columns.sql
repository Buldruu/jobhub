-- Make last_name and first_name nullable for worker listings that don't need personal names
ALTER TABLE job_seeker_listings ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE job_seeker_listings ALTER COLUMN first_name DROP NOT NULL;
