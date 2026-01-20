-- Fix listing_type constraint to allow all types
ALTER TABLE job_seeker_listings DROP CONSTRAINT IF EXISTS job_seeker_listings_listing_type_check;
ALTER TABLE job_seeker_listings ADD CONSTRAINT job_seeker_listings_listing_type_check 
  CHECK (listing_type IN ('job', 'worker', 'internship', 'training'));
