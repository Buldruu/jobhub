-- Create profiles table for both workers and employers
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('worker', 'employer')),
  organization_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_mn TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_type TEXT CHECK (salary_type IN ('hourly', 'daily', 'monthly', 'fixed')),
  duration TEXT,
  requirements TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, worker_id)
);

-- Create worker requests table (workers looking for work)
CREATE TABLE IF NOT EXISTS worker_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  expected_salary TEXT,
  availability TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id, job_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "Employers can insert jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own jobs" ON jobs
  FOR DELETE USING (auth.uid() = employer_id);

-- Applications policies
CREATE POLICY "Users can view applications for their jobs or their own applications" ON applications
  FOR SELECT USING (
    auth.uid() = worker_id OR 
    auth.uid() IN (SELECT employer_id FROM jobs WHERE id = job_id)
  );

CREATE POLICY "Workers can insert applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Job owners can update application status" ON applications
  FOR UPDATE USING (
    auth.uid() IN (SELECT employer_id FROM jobs WHERE id = job_id)
  );

-- Worker requests policies
CREATE POLICY "Worker requests are viewable by everyone" ON worker_requests
  FOR SELECT USING (true);

CREATE POLICY "Workers can insert their own requests" ON worker_requests
  FOR INSERT WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Workers can update their own requests" ON worker_requests
  FOR UPDATE USING (auth.uid() = worker_id);

CREATE POLICY "Workers can delete their own requests" ON worker_requests
  FOR DELETE USING (auth.uid() = worker_id);

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone" ON ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Insert default categories
INSERT INTO categories (name, name_mn, icon) VALUES
  ('Construction', 'Барилга', 'building'),
  ('Cleaning', 'Цэвэрлэгээ', 'sparkles'),
  ('Driving', 'Жолооч', 'car'),
  ('Cooking', 'Тогооч', 'utensils'),
  ('Security', 'Хамгаалалт', 'shield'),
  ('Childcare', 'Хүүхэд харах', 'baby'),
  ('Gardening', 'Цэцэрлэг', 'flower'),
  ('Moving', 'Зөөвөр', 'truck'),
  ('Repair', 'Засвар', 'wrench'),
  ('Other', 'Бусад', 'more-horizontal')
ON CONFLICT DO NOTHING;
