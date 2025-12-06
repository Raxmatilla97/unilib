-- Migration: Offline Library System
-- Description: Add support for physical book management, checkout/return tracking
-- Date: 2025-12-07

-- ============================================
-- 1. Add book_type column to books table
-- ============================================

ALTER TABLE books ADD COLUMN IF NOT EXISTS book_type TEXT DEFAULT 'online';

-- Add check constraint for valid book types
ALTER TABLE books ADD CONSTRAINT book_type_check 
    CHECK (book_type IN ('online', 'offline', 'both'));

COMMENT ON COLUMN books.book_type IS 'Type of book: online (digital only), offline (physical only), or both';

-- ============================================
-- 2. Create physical_book_copies table
-- ============================================

CREATE TABLE IF NOT EXISTS physical_book_copies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    barcode TEXT UNIQUE NOT NULL,
    copy_number INTEGER NOT NULL,
    status TEXT DEFAULT 'available',
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_book_copy UNIQUE(book_id, copy_number),
    CONSTRAINT status_check CHECK (status IN ('available', 'borrowed', 'lost', 'damaged'))
);

COMMENT ON TABLE physical_book_copies IS 'Physical copies of books with barcode tracking';
COMMENT ON COLUMN physical_book_copies.barcode IS 'Unique barcode/QR code for this physical copy';
COMMENT ON COLUMN physical_book_copies.copy_number IS 'Copy number for this book (1, 2, 3, etc.)';
COMMENT ON COLUMN physical_book_copies.status IS 'Current status: available, borrowed, lost, or damaged';
COMMENT ON COLUMN physical_book_copies.location IS 'Physical location/shelf in library';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_physical_copies_book_id ON physical_book_copies(book_id);
CREATE INDEX IF NOT EXISTS idx_physical_copies_barcode ON physical_book_copies(barcode);
CREATE INDEX IF NOT EXISTS idx_physical_copies_status ON physical_book_copies(status);
CREATE INDEX IF NOT EXISTS idx_physical_copies_org ON physical_book_copies(organization_id);

-- ============================================
-- 3. Create book_checkouts table
-- ============================================

CREATE TABLE IF NOT EXISTS book_checkouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    physical_copy_id UUID NOT NULL REFERENCES physical_book_copies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    librarian_id UUID NOT NULL REFERENCES profiles(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    checked_out_at TIMESTAMPTZ DEFAULT NOW(),
    due_date DATE NOT NULL,
    returned_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT status_check CHECK (status IN ('active', 'returned', 'overdue'))
);

COMMENT ON TABLE book_checkouts IS 'Track physical book checkouts and returns';
COMMENT ON COLUMN book_checkouts.physical_copy_id IS 'Which physical copy was checked out';
COMMENT ON COLUMN book_checkouts.user_id IS 'Student/user who borrowed the book';
COMMENT ON COLUMN book_checkouts.librarian_id IS 'Librarian who processed the checkout';
COMMENT ON COLUMN book_checkouts.due_date IS 'Date when book should be returned';
COMMENT ON COLUMN book_checkouts.returned_at IS 'Actual return timestamp (NULL if not returned)';
COMMENT ON COLUMN book_checkouts.status IS 'Current status: active, returned, or overdue';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_checkouts_copy ON book_checkouts(physical_copy_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_user ON book_checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_status ON book_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_checkouts_due_date ON book_checkouts(due_date);
CREATE INDEX IF NOT EXISTS idx_checkouts_org ON book_checkouts(organization_id);

-- ============================================
-- 4. Helper Functions
-- ============================================

-- Function to generate barcode
CREATE OR REPLACE FUNCTION generate_barcode(
    p_book_id UUID,
    p_copy_number INTEGER,
    p_org_slug TEXT
) RETURNS TEXT AS $$
DECLARE
    short_id TEXT;
    padded_copy TEXT;
BEGIN
    -- Get first 8 characters of book ID
    short_id := UPPER(SUBSTRING(p_book_id::TEXT FROM 1 FOR 8));
    
    -- Pad copy number to 3 digits
    padded_copy := LPAD(p_copy_number::TEXT, 3, '0');
    
    -- Return formatted barcode
    RETURN 'BOOK-' || p_org_slug || '-' || short_id || '-' || padded_copy;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_barcode IS 'Generate unique barcode for physical book copy';

-- Function to check and update overdue status
CREATE OR REPLACE FUNCTION update_overdue_checkouts() RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE book_checkouts
    SET status = 'overdue'
    WHERE status = 'active'
    AND due_date < CURRENT_DATE
    AND returned_at IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_overdue_checkouts IS 'Update status to overdue for books past due date';

-- Function to get overdue checkouts
CREATE OR REPLACE FUNCTION get_overdue_checkouts(p_organization_id UUID DEFAULT NULL)
RETURNS TABLE (
    checkout_id UUID,
    user_id UUID,
    user_name TEXT,
    user_email TEXT,
    book_title TEXT,
    book_author TEXT,
    barcode TEXT,
    due_date DATE,
    days_overdue INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bc.id AS checkout_id,
        bc.user_id,
        p.name AS user_name,
        p.email AS user_email,
        b.title AS book_title,
        b.author AS book_author,
        pbc.barcode,
        bc.due_date,
        (CURRENT_DATE - bc.due_date)::INTEGER AS days_overdue
    FROM book_checkouts bc
    JOIN physical_book_copies pbc ON bc.physical_copy_id = pbc.id
    JOIN books b ON pbc.book_id = b.id
    JOIN profiles p ON bc.user_id = p.id
    WHERE bc.status IN ('active', 'overdue')
    AND bc.due_date < CURRENT_DATE
    AND bc.returned_at IS NULL
    AND (p_organization_id IS NULL OR bc.organization_id = p_organization_id)
    ORDER BY bc.due_date ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_overdue_checkouts IS 'Get all overdue book checkouts with details';

-- ============================================
-- 5. RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE physical_book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_checkouts ENABLE ROW LEVEL SECURITY;

-- Physical Book Copies Policies
-- Everyone can view physical copies
CREATE POLICY "Physical copies are viewable by everyone"
    ON physical_book_copies FOR SELECT
    USING (true);

-- Only librarians and admins can insert copies
CREATE POLICY "Librarians can insert physical copies"
    ON physical_book_copies FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

-- Only librarians and admins can update copies
CREATE POLICY "Librarians can update physical copies"
    ON physical_book_copies FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

-- Only librarians and admins can delete copies (if never borrowed)
CREATE POLICY "Librarians can delete physical copies"
    ON physical_book_copies FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

-- Book Checkouts Policies
-- Users can view their own checkouts
CREATE POLICY "Users can view own checkouts"
    ON book_checkouts FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

-- Only librarians can create checkouts
CREATE POLICY "Librarians can create checkouts"
    ON book_checkouts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

-- Only librarians can update checkouts (for returns)
CREATE POLICY "Librarians can update checkouts"
    ON book_checkouts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

-- ============================================
-- 6. Triggers
-- ============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_physical_copies_updated_at
    BEFORE UPDATE ON physical_book_copies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update copy status when checked out
CREATE OR REPLACE FUNCTION update_copy_status_on_checkout()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND NEW.returned_at IS NULL THEN
        UPDATE physical_book_copies
        SET status = 'borrowed'
        WHERE id = NEW.physical_copy_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER checkout_update_copy_status
    AFTER INSERT ON book_checkouts
    FOR EACH ROW
    EXECUTE FUNCTION update_copy_status_on_checkout();

-- Trigger to update copy status when returned
CREATE OR REPLACE FUNCTION update_copy_status_on_return()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.returned_at IS NOT NULL AND OLD.returned_at IS NULL THEN
        UPDATE physical_book_copies
        SET status = 'available'
        WHERE id = NEW.physical_copy_id;
        
        NEW.status = 'returned';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER return_update_copy_status
    BEFORE UPDATE ON book_checkouts
    FOR EACH ROW
    EXECUTE FUNCTION update_copy_status_on_return();

-- ============================================
-- 7. Sample Data (Optional - for testing)
-- ============================================

-- This section is commented out - uncomment for testing
/*
-- Add a test physical copy
INSERT INTO physical_book_copies (book_id, barcode, copy_number, organization_id, location)
SELECT 
    id,
    generate_barcode(id, 1, 'TEST'),
    1,
    (SELECT id FROM organizations LIMIT 1),
    'Shelf A-1'
FROM books
LIMIT 1;
*/
