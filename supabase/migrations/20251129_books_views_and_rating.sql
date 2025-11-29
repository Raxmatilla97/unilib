-- Add views_count column and related functions to existing books table
-- Run this AFTER books table exists

-- Add views_count column
ALTER TABLE books ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Function to increment book views
CREATE OR REPLACE FUNCTION increment_book_views(book_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE books
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = book_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_book_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_book_views(UUID) TO anon;

-- Function to update book rating based on reviews
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

-- Trigger to update book rating when review changes
DROP TRIGGER IF EXISTS update_book_rating_trigger ON book_reviews;
CREATE TRIGGER update_book_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON book_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_book_rating();
