-- Migration: Add book reviews and views tracking (Simplified)
-- Created: 2025-11-29
-- Note: This assumes 'books' and 'profiles' tables already exist

-- ============================================
-- ADD VIEWS COUNT TO BOOKS TABLE (if not exists)
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'views_count'
    ) THEN
        ALTER TABLE books ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================
-- BOOK REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS book_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(book_id, user_id)
);

-- Add foreign keys only if tables exist
DO $$
BEGIN
    -- Add foreign key to books if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'books') THEN
        ALTER TABLE book_reviews 
        DROP CONSTRAINT IF EXISTS book_reviews_book_id_fkey,
        ADD CONSTRAINT book_reviews_book_id_fkey 
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key to profiles if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE book_reviews 
        DROP CONSTRAINT IF EXISTS book_reviews_user_id_fkey,
        ADD CONSTRAINT book_reviews_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- RLS POLICIES FOR BOOK_REVIEWS
-- ============================================
ALTER TABLE book_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON book_reviews;
CREATE POLICY "Reviews are viewable by everyone"
    ON book_reviews FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON book_reviews;
CREATE POLICY "Authenticated users can create reviews"
    ON book_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON book_reviews;
CREATE POLICY "Users can update own reviews"
    ON book_reviews FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON book_reviews;
CREATE POLICY "Users can delete own reviews"
    ON book_reviews FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION TO UPDATE BOOK RATING
-- ============================================
CREATE OR REPLACE FUNCTION update_book_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM book_reviews
        WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
    )
    WHERE id = COALESCE(NEW.book_id, OLD.book_id);
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_book_rating_trigger ON book_reviews;
CREATE TRIGGER update_book_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON book_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_book_rating();

-- ============================================
-- TRIGGER FOR UPDATED_AT ON REVIEWS
-- ============================================
-- Check if update_updated_at_column function exists, if not create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_book_reviews_updated_at ON book_reviews;
CREATE TRIGGER update_book_reviews_updated_at
    BEFORE UPDATE ON book_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION TO INCREMENT BOOK VIEWS
-- ============================================
CREATE OR REPLACE FUNCTION increment_book_views(book_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE books
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = book_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_book_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_book_views(UUID) TO anon;
