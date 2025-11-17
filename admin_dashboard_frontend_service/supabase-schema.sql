-- Admin Dashboard Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create enums
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'blocked');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior');
CREATE TYPE resource_type AS ENUM ('course', 'video', 'article', 'tutorial');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    status user_status DEFAULT 'active',
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    profile_data JSONB DEFAULT '{"profile_completeness": 0}',
    learning_progress JSONB DEFAULT '{"completed_courses": 0, "hours_spent": 0, "certifications_earned": 0}'
);

-- Jobs table
CREATE TABLE public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    category TEXT NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    experience_level experience_level NOT NULL,
    location TEXT,
    salary TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applicants_count INTEGER DEFAULT 0
);

-- Learning resources table
CREATE TABLE public.learning_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type resource_type NOT NULL,
    skill_category TEXT NOT NULL,
    url TEXT NOT NULL,
    duration TEXT,
    difficulty difficulty_level NOT NULL,
    provider TEXT,
    is_free BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User skills table (tracks assessed skills and gaps)
CREATE TABLE public.user_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    assessment_score INTEGER CHECK (assessment_score >= 0 AND assessment_score <= 100),
    is_gap BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job applications table
CREATE TABLE public.job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_last_active ON public.users(last_active_at);
CREATE INDEX idx_jobs_category ON public.jobs(category);
CREATE INDEX idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at);
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX idx_user_skills_is_gap ON public.user_skills(is_gap);
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_resources_updated_at BEFORE UPDATE ON public.learning_resources 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update job applicants count
CREATE OR REPLACE FUNCTION update_job_applicants_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.jobs 
        SET applicants_count = applicants_count + 1 
        WHERE id = NEW.job_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.jobs 
        SET applicants_count = applicants_count - 1 
        WHERE id = OLD.job_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_applicants_count_trigger
    AFTER INSERT OR DELETE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION update_job_applicants_count();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Admin can see all data
CREATE POLICY "Admin full access" ON public.users
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND (role = 'admin' OR role = 'moderator')
    )
);

-- Users can see their own data
CREATE POLICY "Users can view own data" ON public.users
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- Public read access for jobs and resources
CREATE POLICY "Public read access for jobs" ON public.jobs
FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for resources" ON public.learning_resources
FOR SELECT USING (true);

-- Admin write access for jobs and resources
CREATE POLICY "Admin write access for jobs" ON public.jobs
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND (role = 'admin' OR role = 'moderator')
    )
);

CREATE POLICY "Admin write access for resources" ON public.learning_resources
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND (role = 'admin' OR role = 'moderator')
    )
);

-- Insert sample data
INSERT INTO public.users (id, email, name, status, role, profile_data, learning_progress) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@sdg8.com', 'Admin User', 'active', 'admin', 
     '{"location": "Global", "experience_level": "senior", "profile_completeness": 100}',
     '{"completed_courses": 25, "hours_spent": 150, "certifications_earned": 8}'),
    ('22222222-2222-2222-2222-222222222222', 'sarah.johnson@email.com', 'Sarah Johnson', 'active', 'user',
     '{"location": "New York, NY", "experience_level": "mid", "current_job": "Frontend Developer", "target_role": "Senior Frontend Developer", "profile_completeness": 85}',
     '{"completed_courses": 8, "hours_spent": 45, "certifications_earned": 2}');

INSERT INTO public.jobs (title, company, category, required_skills, experience_level, location, salary, is_active) VALUES
    ('Frontend Developer', 'Tech Corp', 'Frontend', ARRAY['React', 'TypeScript', 'CSS'], 'mid', 'Remote', '$60-80k', true),
    ('Backend Engineer', 'StartupXYZ', 'Backend', ARRAY['Node.js', 'MongoDB', 'Express', 'AWS'], 'senior', 'New York, NY', '$100-120k', true),
    ('Data Scientist', 'Data Insights Co', 'Data Science', ARRAY['Python', 'TensorFlow', 'SQL', 'Pandas'], 'mid', 'Boston, MA', '$85-100k', true);

INSERT INTO public.learning_resources (title, type, skill_category, url, difficulty, provider, is_free) VALUES
    ('React - The Complete Guide', 'course', 'React', 'https://example.com/react-course', 'beginner', 'Udemy', false),
    ('JavaScript Fundamentals', 'video', 'JavaScript', 'https://youtube.com/js-fundamentals', 'beginner', 'YouTube', true),
    ('Advanced TypeScript Patterns', 'article', 'TypeScript', 'https://medium.com/typescript-patterns', 'advanced', 'Medium', true);