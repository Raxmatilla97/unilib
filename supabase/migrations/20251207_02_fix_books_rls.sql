-- Fix RLS policies for books table to allow librarians to insert/update
-- Date: 2025-12-07

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;
DROP POLICY IF EXISTS "Librarians can insert books" ON books;
DROP POLICY IF EXISTS "Librarians can update books" ON books;
DROP POLICY IF EXISTS "Librarians can delete books" ON books;

-- Create comprehensive RLS policies for books table

-- Everyone can view books
CREATE POLICY "Books are viewable by everyone"
    ON books FOR SELECT
    USING (true);

-- Librarians and above can insert books
CREATE POLICY "Librarians can insert books"
    ON books FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

-- Librarians and above can update books
CREATE POLICY "Librarians can update books"
    ON books FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

-- Librarians and above can delete books
CREATE POLICY "Librarians can delete books"
    ON books FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );
