-- Add job_type column to jobs table to distinguish between job types
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type_category TEXT DEFAULT 'job' CHECK (job_type_category IN ('job', 'worker', 'internship', 'training'));

-- Create job seeker listings table (for workers posting their CV/profile to find jobs)
CREATE TABLE IF NOT EXISTS job_seeker_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  education TEXT,
  experience TEXT,
  cv_url TEXT,
  cv_filename TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  listing_type TEXT DEFAULT 'job' CHECK (listing_type IN ('job', 'internship')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create completed jobs table for tracking finished work
CREATE TABLE IF NOT EXISTS completed_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  worker_rating INTEGER CHECK (worker_rating >= 1 AND worker_rating <= 5),
  employer_rating INTEGER CHECK (employer_rating >= 1 AND employer_rating <= 5),
  worker_comment TEXT,
  employer_comment TEXT
);

-- Enable RLS on new tables
ALTER TABLE job_seeker_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_jobs ENABLE ROW LEVEL SECURITY;

-- Job seeker listings policies
CREATE POLICY "Job seeker listings are viewable by everyone" ON job_seeker_listings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own listings" ON job_seeker_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON job_seeker_listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON job_seeker_listings
  FOR DELETE USING (auth.uid() = user_id);

-- Completed jobs policies
CREATE POLICY "Completed jobs are viewable by participants" ON completed_jobs
  FOR SELECT USING (auth.uid() = worker_id OR auth.uid() = employer_id);

CREATE POLICY "Employers can insert completed jobs" ON completed_jobs
  FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Participants can update completed jobs for ratings" ON completed_jobs
  FOR UPDATE USING (auth.uid() = worker_id OR auth.uid() = employer_id);

-- Create storage bucket for CV uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cv-files', 'cv-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for CV files
CREATE POLICY "Anyone can view CV files" ON storage.objects
  FOR SELECT USING (bucket_id = 'cv-files');

CREATE POLICY "Users can upload their own CV files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cv-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own CV files" ON storage.objects
  FOR DELETE USING (bucket_id = 'cv-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to calculate average rating for a user
CREATE OR REPLACE FUNCTION calculate_user_average_rating(user_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  avg_rating DECIMAL;
BEGIN
  SELECT AVG(
    CASE 
      WHEN worker_id = user_uuid THEN worker_rating
      WHEN employer_id = user_uuid THEN employer_rating
    END
  )
  INTO avg_rating
  FROM completed_jobs
  WHERE (worker_id = user_uuid OR employer_id = user_uuid)
    AND (
      (worker_id = user_uuid AND worker_rating IS NOT NULL) OR
      (employer_id = user_uuid AND employer_rating IS NOT NULL)
    );
  
  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;
