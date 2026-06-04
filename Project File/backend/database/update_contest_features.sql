-- ============================================================
-- StudyGlobe Contest Features Database Migrations
-- Run this in Supabase SQL Editor to support the new features
-- ============================================================

-- 1. APPLICATION TASK MANAGER
CREATE TABLE IF NOT EXISTS application_tasks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DOCUMENT CHECKLIST SYSTEM (Using Google Drive URLs only)
CREATE TABLE IF NOT EXISTS user_documents (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- e.g., 'SOP', 'LOR 1', 'LOR 2', 'Academic Transcript', 'Passport Copy'
  status VARCHAR(50) DEFAULT 'missing' CHECK (status IN ('missing', 'uploaded', 'verified')),
  google_drive_url TEXT, -- Google Drive URL for file submission
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, document_type)
);

-- 3. PRE-DEPARTURE CHECKLIST
CREATE TABLE IF NOT EXISTS user_predeparture (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key VARCHAR(150) NOT NULL, -- e.g., 'accommodation', 'flight_booked', 'visa_copy', 'forex_card', 'baggage_essentials'
  is_completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, item_key)
);

-- 4. RESOURCE LIBRARY
CREATE TABLE IF NOT EXISTS resource_library (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL, -- e.g., 'IELTS Academic', 'IELTS General', 'TOEFL Preparation', 'Visa Templates'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  external_url TEXT,
  file_path TEXT, -- Optional downloadable guides
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COUNTRY-SPECIFIC GUIDELINES MODULE
CREATE TABLE IF NOT EXISTS country_guidelines (
  id SERIAL PRIMARY KEY,
  country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  visa_rules TEXT,
  work_permit_rules TEXT,
  living_costs TEXT,
  general_requirements TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (country_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE application_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_predeparture ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_guidelines ENABLE ROW LEVEL SECURITY;

-- Enable select policies for everyone/authenticated users
CREATE POLICY "Public read resources" ON resource_library FOR SELECT USING (true);
CREATE POLICY "Public read country guidelines" ON country_guidelines FOR SELECT USING (true);

-- User-scoped policies
CREATE POLICY "Users can manage own application tasks" ON application_tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own documents" ON user_documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own pre-departure status" ON user_predeparture
  FOR ALL USING (auth.uid() = user_id);
