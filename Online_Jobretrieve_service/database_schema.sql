-- Database Schema for Job Retrieval Service
-- This schema is designed for Supabase/PostgreSQL

-- Retrieved Jobs Table (separate from main jobs workflow)
CREATE TABLE IF NOT EXISTS retrieveJobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_job_id VARCHAR(255) UNIQUE, -- ID from the external API
    title VARCHAR(500) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    remote BOOLEAN DEFAULT false,
    job_type VARCHAR(50), -- full-time, part-time, contract, internship
    experience_level VARCHAR(50), -- entry, mid, senior
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    salary_currency VARCHAR(10),
    description TEXT,
    requirements TEXT,
    benefits TEXT,
    apply_url VARCHAR(1000),
    company_logo VARCHAR(1000),
    category VARCHAR(100), -- IT, Marketing, Finance, etc.
    posted_date TIMESTAMP,
    expiry_date TIMESTAMP,
    source VARCHAR(100), -- adzuna, jsearch, themuse, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Retrieved Job Skills Table (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS retrieveJob_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES retrieveJobs(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(job_id, skill_name)
);

-- Skills Master Table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50), -- programming, framework, tool, soft-skill
    created_at TIMESTAMP DEFAULT NOW()
);

-- Job Fetch Log (Track API calls and status)
CREATE TABLE IF NOT EXISTS job_fetch_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(100) NOT NULL,
    fetch_date TIMESTAMP DEFAULT NOW(),
    jobs_fetched INTEGER DEFAULT 0,
    status VARCHAR(50), -- success, failed, partial
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Job Applications (if needed)
CREATE TABLE IF NOT EXISTS retrieveJob_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References your user table
    job_id UUID REFERENCES retrieveJobs(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'applied', -- applied, shortlisted, rejected, accepted
    applied_at TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    UNIQUE(user_id, job_id)
);

-- Saved Jobs (User Bookmarks)
CREATE TABLE IF NOT EXISTS saved_retrieveJobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    job_id UUID REFERENCES retrieveJobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_retrieveJobs_title ON retrieveJobs(title);
CREATE INDEX IF NOT EXISTS idx_retrieveJobs_company ON retrieveJobs(company);
CREATE INDEX IF NOT EXISTS idx_retrieveJobs_location ON retrieveJobs(location);
CREATE INDEX IF NOT EXISTS idx_retrieveJobs_category ON retrieveJobs(category);
CREATE INDEX IF NOT EXISTS idx_retrieveJobs_source ON retrieveJobs(source);
CREATE INDEX IF NOT EXISTS idx_retrieveJobs_posted_date ON retrieveJobs(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_retrieveJobs_is_active ON retrieveJobs(is_active);
CREATE INDEX IF NOT EXISTS idx_retrieveJob_skills_skill_name ON retrieveJob_skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_retrieveJob_applications_user_id ON retrieveJob_applications(user_id);

-- Full-text search index for job search
CREATE INDEX IF NOT EXISTS idx_retrieveJobs_search ON retrieveJobs
    USING gin(to_tsvector('english', title || ' ' || company || ' ' || COALESCE(description, '')));
