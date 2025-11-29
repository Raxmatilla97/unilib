-- Create books table if it doesn't exist
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    cover_color TEXT DEFAULT 'bg-blue-500',
    file_url TEXT,
    pdf_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    pages INTEGER,
    total_pages INTEGER DEFAULT 0,
    year INTEGER,
    language TEXT,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;

-- Create policy
CREATE POLICY "Books are viewable by everyone"
    ON books FOR SELECT
    USING (true);

-- Sample data (optional - remove if you already have books)
INSERT INTO books (title, author, category, description, cover_color, rating, total_pages, year, language) VALUES
('Introduction to Algorithms', 'Thomas H. Cormen', 'Computer Science', 'A comprehensive textbook on computer algorithms', 'bg-red-500', 4.9, 1312, 2009, 'English'),
('Clean Code', 'Robert C. Martin', 'Software Engineering', 'A handbook of agile software craftsmanship', 'bg-blue-500', 4.8, 464, 2008, 'English'),
('The Pragmatic Programmer', 'Andrew Hunt', 'Career', 'Your journey to mastery', 'bg-emerald-500', 4.9, 352, 2019, 'English'),
('Design Patterns', 'Erich Gamma', 'Architecture', 'Elements of reusable object-oriented software', 'bg-purple-500', 4.7, 416, 1994, 'English')
ON CONFLICT (isbn) DO NOTHING;
