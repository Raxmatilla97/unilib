-- Migration: Add book reviews (Standalone - no dependency on books table)
-- Created: 2025-11-29
-- Run this AFTER you have created the books and profiles tables

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
-- TRIGGER FOR UPDATED_AT ON REVIEWS
-- ============================================
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
