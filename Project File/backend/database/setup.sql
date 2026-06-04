-- ============================================================
-- StudyGlobe Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- User profiles (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  preferred_country VARCHAR(100),
  degree_level VARCHAR(50),
  field_of_study VARCHAR(100),
  budget_range VARCHAR(100),
  language_test VARCHAR(50),
  language_score DECIMAL(5,2),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS universities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
  location VARCHAR(255),
  description TEXT,
  website VARCHAR(255),
  ranking INTEGER,
  tuition_min DECIMAL(10,2),
  tuition_max DECIMAL(10,2),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  degree_level VARCHAR(50),
  field VARCHAR(100),
  duration_years DECIMAL(3,1),
  tuition_fee DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FIX: FR-07 — Intake Schedule table (was missing)
CREATE TABLE IF NOT EXISTS intakes (
  id SERIAL PRIMARY KEY,
  university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
  session_name VARCHAR(100),
  start_date DATE,
  application_deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FIX: FR-08 — Language Requirements table (was missing)
CREATE TABLE IF NOT EXISTS language_requirements (
  id SERIAL PRIMARY KEY,
  university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
  test_name VARCHAR(50),
  minimum_score DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FIX: FR-09 — Scholarship Eligibility table (was missing)
CREATE TABLE IF NOT EXISTS scholarship_eligibility (
  id SERIAL PRIMARY KEY,
  university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
  name VARCHAR(255),
  eligibility_criteria TEXT,
  amount VARCHAR(100),
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarship_eligibility ENABLE ROW LEVEL SECURITY;

-- Public read on all lookup tables
CREATE POLICY "public_read_countries" ON countries FOR SELECT USING (true);
CREATE POLICY "public_read_universities" ON universities FOR SELECT USING (true);
CREATE POLICY "public_read_programs" ON programs FOR SELECT USING (true);
CREATE POLICY "public_read_intakes" ON intakes FOR SELECT USING (true);
CREATE POLICY "public_read_lang_req" ON language_requirements FOR SELECT USING (true);
CREATE POLICY "public_read_scholarships" ON scholarship_eligibility FOR SELECT USING (true);

-- Users can only access their own profile
CREATE POLICY "own_profile_select" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own_profile_update" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own_profile_insert" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin-only write policies (FR-10)
CREATE POLICY "admin_manage_countries" ON countries FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "admin_manage_universities" ON universities FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "admin_manage_programs" ON programs FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "admin_manage_intakes" ON intakes FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "admin_manage_lang_req" ON language_requirements FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "admin_manage_scholarships" ON scholarship_eligibility FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
