-- Add columns for organization and individual worker listings
ALTER TABLE job_seeker_listings ADD COLUMN IF NOT EXISTS worker_type TEXT DEFAULT 'individual';
ALTER TABLE job_seeker_listings ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE job_seeker_listings ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE job_seeker_listings ADD COLUMN IF NOT EXISTS skills TEXT;
ALTER TABLE job_seeker_listings ADD COLUMN IF NOT EXISTS field TEXT;
ALTER TABLE job_seeker_listings ADD COLUMN IF NOT EXISTS salary TEXT;
ALTER TABLE job_seeker_listings ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE job_seeker_listings ADD COLUMN IF NOT EXISTS job_description TEXT;
ALTER TABLE job_seeker_listings ADD COLUMN IF NOT EXISTS wage TEXT;
ALTER TABLE job_seeker_listings ADD COLUMN IF NOT EXISTS additional_info TEXT;
