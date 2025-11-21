-- UniLib Database Schema for Supabase
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/gghpcaamqreqvvjixesm/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    university TEXT,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- BOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    cover_color TEXT DEFAULT 'bg-blue-500',
    pdf_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    total_pages INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for books
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Books are viewable by everyone"
    ON books FOR SELECT
    USING (true);

-- ============================================
-- STUDY GROUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS study_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    book TEXT NOT NULL,
    creator_id UUID REFERENCES profiles(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    member_count INTEGER DEFAULT 1,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for study groups
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Study groups are viewable by everyone"
    ON study_groups FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create groups"
    ON study_groups FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Group creators can update their groups"
    ON study_groups FOR UPDATE
    USING (auth.uid() = creator_id);

-- ============================================
-- GROUP MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS group_members (
    group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- RLS Policies for group members
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members are viewable by everyone"
    ON group_members FOR SELECT
    USING (true);

CREATE POLICY "Users can join groups"
    ON group_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
    ON group_members FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- USER PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    current_page INTEGER DEFAULT 1,
    total_pages INTEGER,
    progress_percentage INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- RLS Policies for user progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
    ON user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
    ON user_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
    ON user_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- CITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    book_title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER,
    publisher TEXT,
    format TEXT NOT NULL, -- APA, MLA, Chicago, Harvard
    citation_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for citations
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own citations"
    ON citations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create citations"
    ON citations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE study_groups
        SET member_count = member_count + 1
        WHERE id = NEW.group_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE study_groups
        SET member_count = member_count - 1
        WHERE id = OLD.group_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for group members
CREATE TRIGGER update_group_count
    AFTER INSERT OR DELETE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION update_group_member_count();

-- ============================================
-- SEED DATA (Sample Books)
-- ============================================
INSERT INTO books (title, author, category, description, cover_color, rating, total_pages) VALUES
('Introduction to Algorithms', 'Thomas H. Cormen', 'Computer Science', 'A comprehensive textbook on computer algorithms', 'bg-red-500', 4.9, 1312),
('Clean Code', 'Robert C. Martin', 'Software Engineering', 'A handbook of agile software craftsmanship', 'bg-blue-500', 4.8, 464),
('The Pragmatic Programmer', 'Andrew Hunt', 'Career', 'Your journey to mastery', 'bg-emerald-500', 4.9, 352),
('Design Patterns', 'Erich Gamma', 'Architecture', 'Elements of reusable object-oriented software', 'bg-purple-500', 4.7, 416),
('Structure and Interpretation', 'Harold Abelson', 'Computer Science', 'Computer programs structure and interpretation', 'bg-indigo-500', 4.9, 657),
('Code Complete', 'Steve McConnell', 'Software Engineering', 'A practical handbook of software construction', 'bg-orange-500', 4.8, 960),
('Refactoring', 'Martin Fowler', 'Software Engineering', 'Improving the design of existing code', 'bg-pink-500', 4.7, 448),
('Head First Design Patterns', 'Eric Freeman', 'Architecture', 'A brain-friendly guide', 'bg-teal-500', 4.8, 694)
ON CONFLICT (isbn) DO NOTHING;

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these in Supabase Dashboard → Storage

-- 1. Create 'book-covers' bucket (public)
-- 2. Create 'book-pdfs' bucket (authenticated only)
-- 3. Create 'avatars' bucket (public)

-- Storage policies will be set in the Dashboard
