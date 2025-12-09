-- Performance Optimization: Add Database Indexes
-- This migration adds indexes to speed up common queries

-- Speed up user_progress queries (used in dashboard and profile)
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id 
ON user_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_progress_last_read 
ON user_progress(user_id, last_read_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_progress_book_id 
ON user_progress(book_id);

-- Speed up book_checkouts queries (used in profile)
CREATE INDEX IF NOT EXISTS idx_book_checkouts_user_status 
ON book_checkouts(user_id, status);

CREATE INDEX IF NOT EXISTS idx_book_checkouts_due_date 
ON book_checkouts(user_id, status, due_date);

-- Speed up daily_progress queries (used in dashboard)
CREATE INDEX IF NOT EXISTS idx_daily_progress_date 
ON daily_progress(date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_progress_schedule 
ON daily_progress(schedule_id, date DESC);

-- Speed up reading_schedule queries (used in dashboard)
CREATE INDEX IF NOT EXISTS idx_reading_schedule_user_status 
ON reading_schedule(user_id, status);

CREATE INDEX IF NOT EXISTS idx_reading_schedule_dates 
ON reading_schedule(user_id, status, end_date);

-- Speed up books queries (used in library)
CREATE INDEX IF NOT EXISTS idx_books_category 
ON books(category);

CREATE INDEX IF NOT EXISTS idx_books_rating 
ON books(rating DESC);

CREATE INDEX IF NOT EXISTS idx_books_created 
ON books(created_at DESC);

-- Speed up profiles queries
CREATE INDEX IF NOT EXISTS idx_profiles_xp 
ON profiles(xp DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_streak 
ON profiles(streak_days DESC);

-- Composite index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard 
ON profiles(xp DESC, level DESC, streak_days DESC);

-- Text search indexes for books
CREATE INDEX IF NOT EXISTS idx_books_title_search 
ON books USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_books_author_search 
ON books USING gin(to_tsvector('english', author));
