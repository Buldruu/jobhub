-- Add tracking for individual job listings with ratings
-- job_applications table for tracking who applied/completed individual jobs

CREATE TABLE IF NOT EXISTS individual_job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES job_seeker_listings(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poster_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  -- Rating given by applicant (worker) to poster after job completion
  poster_rating INTEGER CHECK (poster_rating >= 1 AND poster_rating <= 5),
  poster_rating_comment TEXT,
  -- Rating given by poster to applicant after job completion
  applicant_rating INTEGER CHECK (applicant_rating >= 1 AND applicant_rating <= 5),
  applicant_rating_comment TEXT,
  -- Completion confirmation
  poster_confirmed_complete BOOLEAN DEFAULT false,
  applicant_confirmed_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(listing_id, applicant_id)
);

-- Enable RLS
ALTER TABLE individual_job_applications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own applications"
  ON individual_job_applications FOR SELECT
  USING (auth.uid() = applicant_id OR auth.uid() = poster_id);

CREATE POLICY "Users can insert applications"
  ON individual_job_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Users can update their own applications"
  ON individual_job_applications FOR UPDATE
  USING (auth.uid() = applicant_id OR auth.uid() = poster_id);
