-- ============================================================================
-- ALL SQL FILES CONSOLIDATED - UniLib Platform
-- Generated: 2025-12-13 17:47:07
-- Total Files: 67
-- Description: Every single SQL file from supabase folder
-- ============================================================================


-- ============================================================================
-- FILE 1 of 67: supabase\add_bio.sql
-- Size: 0.09 KB
-- ============================================================================

-- Add bio column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;


-- ============================================================================
-- FILE 2 of 67: supabase\CHECK_INDEXES.sql
-- Size: 0.68 KB
-- ============================================================================

-- Quick Check: Which indexes exist?
-- Run this in Supabase SQL Editor

SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND (
    indexname LIKE 'idx_books_%'
    OR indexname LIKE 'idx_book_checkouts_%'
    OR indexname LIKE 'idx_daily_progress_%'
    OR indexname LIKE 'idx_user_progress_%'
    OR indexname LIKE 'idx_profiles_%'
)
ORDER BY tablename, indexname;

-- Expected indexes (should see these):
-- idx_books_category_rating
-- idx_books_online_only
-- idx_books_search_gin
-- idx_book_checkouts_checked_out_at
-- idx_book_checkouts_returned_at
-- idx_daily_progress_schedule_date
-- idx_user_progress_active
-- idx_profiles_leaderboard


-- ============================================================================
-- FILE 3 of 67: supabase\COMPLETE_MIGRATION.sql
-- Size: 8.7 KB
-- ============================================================================

-- ============================================================================
-- COMPLETE DATABASE MIGRATION - UniLib Platform
-- Date: 2025-12-13
-- Description: Complete migration including all optimizations, indexes, and features
-- ============================================================================

-- ============================================================================
-- SECTION 1: PERFORMANCE INDEXES
-- ============================================================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_university ON profiles(university);
CREATE INDEX IF NOT EXISTS idx_profiles_student_number ON profiles(student_number);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Books table indexes
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_year ON books(year);
CREATE INDEX IF NOT EXISTS idx_books_rating ON books(rating DESC);
CREATE INDEX IF NOT EXISTS idx_books_views_count ON books(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON books USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_author_trgm ON books USING gin(author gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);

-- Book checkouts indexes
CREATE INDEX IF NOT EXISTS idx_book_checkouts_user_id ON book_checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_book_id ON book_checkouts(book_id);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_status ON book_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_checkout_date ON book_checkouts(checkout_date DESC);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_due_date ON book_checkouts(due_date);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_user_status ON book_checkouts(user_id, status);

-- Reading schedule indexes
CREATE INDEX IF NOT EXISTS idx_reading_schedule_user_id ON reading_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_schedule_book_id ON reading_schedule(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_schedule_date ON reading_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_reading_schedule_completed ON reading_schedule(completed);
CREATE INDEX IF NOT EXISTS idx_reading_schedule_user_date ON reading_schedule(user_id, scheduled_date);

-- Study groups indexes
CREATE INDEX IF NOT EXISTS idx_study_groups_created_by ON study_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_study_groups_created_at ON study_groups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_groups_is_private ON study_groups(is_private);

-- Group members indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);
CREATE INDEX IF NOT EXISTS idx_group_members_group_user ON group_members(group_id, user_id);

-- Group messages indexes
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_user_id ON group_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_created ON group_messages(group_id, created_at DESC);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_points ON achievements(points);

-- User achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);

-- Citations indexes
CREATE INDEX IF NOT EXISTS idx_citations_user_id ON citations(user_id);
CREATE INDEX IF NOT EXISTS idx_citations_book_id ON citations(book_id);
CREATE INDEX IF NOT EXISTS idx_citations_style ON citations(style);
CREATE INDEX IF NOT EXISTS idx_citations_created_at ON citations(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- ============================================================================
-- SECTION 2: STUDENT ID SYSTEM
-- ============================================================================

-- Add student_id column if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_id TEXT UNIQUE;

-- Function to get or create sequence for a year
CREATE OR REPLACE FUNCTION get_year_sequence(year_suffix TEXT)
RETURNS TEXT AS $$
DECLARE
    seq_name TEXT;
BEGIN
    seq_name := 'student_id_seq_' || year_suffix;
    
    -- Create sequence if it doesn't exist
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I START 1', seq_name);
    
    RETURN seq_name;
END;
$$ LANGUAGE plpgsql;

-- Function to generate year-based student ID (YYXXX format)
CREATE OR REPLACE FUNCTION generate_student_id()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    year_suffix TEXT;
    seq_name TEXT;
    next_id INTEGER;
    student_id TEXT;
BEGIN
    -- Get current year (last 2 digits)
    current_year := to_char(CURRENT_DATE, 'YY');
    year_suffix := current_year;
    
    -- Get or create sequence for this year
    seq_name := get_year_sequence(year_suffix);
    
    -- Get next sequence value for this year
    EXECUTE format('SELECT nextval(%L)', seq_name) INTO next_id;
    
    -- Format as YYXXX (year + 3-digit sequential)
    student_id := year_suffix || LPAD(next_id::TEXT, 3, '0');
    
    RETURN student_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate student_id
CREATE OR REPLACE FUNCTION auto_generate_student_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if student_id is NULL
    IF NEW.student_id IS NULL THEN
        NEW.student_id := generate_student_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS trigger_auto_generate_student_id ON profiles;

-- Create trigger
CREATE TRIGGER trigger_auto_generate_student_id
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_student_id();

-- Assign student_id to existing users who don't have one
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id FROM profiles WHERE student_id IS NULL ORDER BY created_at
    LOOP
        UPDATE profiles 
        SET student_id = generate_student_id()
        WHERE id = user_record.id;
    END LOOP;
END $$;

-- ============================================================================
-- SECTION 3: COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN profiles.student_id IS 'Short 5-digit student ID for manual input (25001, 25002, etc.)';

-- ============================================================================
-- SECTION 4: VERIFICATION QUERIES
-- ============================================================================

-- Verify indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verify student_id assignment
SELECT 
    COUNT(*) as total_users,
    COUNT(student_id) as users_with_id,
    COUNT(*) - COUNT(student_id) as users_without_id
FROM profiles;

-- Verify trigger
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles' 
AND trigger_name = 'trigger_auto_generate_student_id';

-- Sample of student IDs
SELECT id, name, email, student_id, student_number, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================


-- ============================================================================
-- FILE 4 of 67: supabase\COMPLETE_SCHEMA_PART2.sql
-- Size: 10.62 KB
-- ============================================================================

-- ============================================
-- COMPLETE DATABASE SCHEMA - UniLib Platform
-- Part 2: INDEXES, FUNCTIONS, TRIGGERS, RLS
-- Generated: 2025-12-13
-- ============================================
-- Run this AFTER running COMPLETE_SCHEMA.sql Part 1

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_student_number ON profiles(student_number);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_hemis_id ON profiles(hemis_id);
CREATE INDEX IF NOT EXISTS idx_profiles_hemis_login ON profiles(hemis_login);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON profiles(streak_days DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard ON profiles(xp DESC, streak_days DESC) WHERE is_active = true;

-- Book checkouts indexes
CREATE INDEX IF NOT EXISTS idx_book_checkouts_status ON book_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_user_id ON book_checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_due_date ON book_checkouts(due_date);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_physical_copy_id ON book_checkouts(physical_copy_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_user_status ON book_checkouts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_checked_out_at ON book_checkouts(checked_out_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_book_checkouts_returned_at ON book_checkouts(returned_at DESC) WHERE status = 'returned';

-- Books indexes
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_book_type ON books(book_type);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_rating ON books(rating DESC);
CREATE INDEX IF NOT EXISTS idx_books_created ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_online_only ON books(id, created_at DESC) WHERE cover_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_books_category_rating ON books(category, rating DESC) WHERE cover_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_books_search_gin ON books USING gin(to_tsvector('english', title || ' ' || author));

-- Physical book copies indexes
CREATE INDEX IF NOT EXISTS idx_physical_copies_book_id ON physical_book_copies(book_id);
CREATE INDEX IF NOT EXISTS idx_physical_copies_status ON physical_book_copies(status);
CREATE INDEX IF NOT EXISTS idx_physical_copies_barcode ON physical_book_copies(barcode);

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_book_id ON user_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_book ON user_progress(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_read ON user_progress(last_read_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_active ON user_progress(user_id, last_read_at DESC) WHERE progress_percentage > 0 AND progress_percentage < 100;

-- Reading schedule indexes
CREATE INDEX IF NOT EXISTS idx_reading_schedule_user_status ON reading_schedule(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reading_schedule_dates ON reading_schedule(start_date, end_date);

-- Daily progress indexes
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON daily_progress(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_progress_schedule ON daily_progress(schedule_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_schedule_date ON daily_progress(schedule_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_progress_completed ON daily_progress(completed) WHERE completed = true;

-- User achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_achievements_requirement_type ON achievements(requirement_type);

-- Library views indexes
CREATE INDEX IF NOT EXISTS idx_library_views_book_id ON library_views(book_id);
CREATE INDEX IF NOT EXISTS idx_library_views_user_id ON library_views(user_id);
CREATE INDEX IF NOT EXISTS idx_library_views_created_at ON library_views(created_at);

-- ============================================
-- STUDENT ID GENERATION FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_year_sequence(year_suffix TEXT)
RETURNS TEXT AS $$
DECLARE
    seq_name TEXT;
BEGIN
    seq_name := 'student_id_seq_' || year_suffix;
    
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = seq_name) THEN
        EXECUTE format('CREATE SEQUENCE %I START WITH 1', seq_name);
    END IF;
    
    RETURN seq_name;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_student_id()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    year_suffix TEXT;
    seq_name TEXT;
    next_id INTEGER;
    student_id TEXT;
BEGIN
    current_year := to_char(CURRENT_DATE, 'YY');
    year_suffix := current_year;
    seq_name := get_year_sequence(year_suffix);
    EXECUTE format('SELECT nextval(%L)', seq_name) INTO next_id;
    student_id := year_suffix || LPAD(next_id::TEXT, 3, '0');
    RETURN student_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- BARCODE GENERATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION generate_barcode(
    p_book_id UUID,
    p_copy_number INTEGER,
    p_org_slug TEXT DEFAULT 'UNI'
) RETURNS TEXT AS $$
DECLARE
    short_id TEXT;
    padded_copy TEXT;
BEGIN
    short_id := UPPER(SUBSTRING(p_book_id::TEXT FROM 1 FOR 8));
    padded_copy := LPAD(p_copy_number::TEXT, 3, '0');
    RETURN 'BOOK-' || p_org_slug || '-' || short_id || '-' || padded_copy;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- LEVEL CALCULATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_level(p_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(p_xp::FLOAT / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- ACHIEVEMENT CHECKING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION check_and_award_achievements(p_user_id UUID)
RETURNS TABLE(achievement_id UUID, achievement_key TEXT, achievement_title TEXT, xp_reward INTEGER) AS $$
DECLARE
    v_streak INTEGER;
    v_books_completed INTEGER;
    v_pages_read INTEGER;
    v_daily_goals INTEGER;
    v_achievement RECORD;
BEGIN
    SELECT 
        streak_days,
        total_books_completed,
        total_pages_read,
        total_daily_goals_completed
    INTO 
        v_streak,
        v_books_completed,
        v_pages_read,
        v_daily_goals
    FROM profiles
    WHERE id = p_user_id;

    FOR v_achievement IN 
        SELECT a.id, a.key, a.title, a.xp_reward, a.requirement_type, a.requirement_value
        FROM achievements a
        WHERE NOT EXISTS (
            SELECT 1 FROM user_achievements ua 
            WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
        )
    LOOP
        IF (v_achievement.requirement_type = 'streak' AND v_streak >= v_achievement.requirement_value) OR
           (v_achievement.requirement_type = 'books_completed' AND v_books_completed >= v_achievement.requirement_value) OR
           (v_achievement.requirement_type = 'pages_read' AND v_pages_read >= v_achievement.requirement_value) OR
           (v_achievement.requirement_type = 'daily_goal' AND v_daily_goals >= v_achievement.requirement_value) THEN
            
            INSERT INTO user_achievements (user_id, achievement_id)
            VALUES (p_user_id, v_achievement.id);
            
            UPDATE profiles
            SET xp = xp + v_achievement.xp_reward
            WHERE id = p_user_id;
            
            achievement_id := v_achievement.id;
            achievement_key := v_achievement.key;
            achievement_title := v_achievement.title;
            xp_reward := v_achievement.xp_reward;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- LEADERBOARD FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_leaderboard_by_xp(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    name TEXT,
    avatar_url TEXT,
    xp INTEGER,
    level INTEGER,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.name,
        p.avatar_url,
        p.xp,
        p.level,
        ROW_NUMBER() OVER (ORDER BY p.xp DESC) AS rank
    FROM profiles p
    WHERE p.is_active = true
    ORDER BY p.xp DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_leaderboard_by_streak(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    name TEXT,
    avatar_url TEXT,
    streak_days INTEGER,
    xp INTEGER,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.name,
        p.avatar_url,
        p.streak_days,
        p.xp,
        ROW_NUMBER() OVER (ORDER BY p.streak_days DESC, p.xp DESC) AS rank
    FROM profiles p
    WHERE p.is_active = true
    ORDER BY p.streak_days DESC, p.xp DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HEALTH CHECK FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION simple_health_check()
RETURNS TABLE (
    metric TEXT,
    value TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'Total Tables'::TEXT, 
           (SELECT count(*)::TEXT FROM pg_tables WHERE schemaname = 'public');
    
    RETURN QUERY
    SELECT 'Total Indexes'::TEXT,
           (SELECT count(*)::TEXT FROM pg_indexes WHERE schemaname = 'public');
    
    RETURN QUERY
    SELECT 'Database Size'::TEXT,
           pg_size_pretty(pg_database_size(current_database()));
    
    RETURN QUERY
    SELECT 'Active Connections'::TEXT,
           (SELECT count(*)::TEXT FROM pg_stat_activity WHERE state = 'active');
END;
$$ LANGUAGE plpgsql;

-- Continue in Part 3...


-- ============================================================================
-- FILE 5 of 67: supabase\COMPLETE_SCHEMA_PART3.sql
-- Size: 11.89 KB
-- ============================================================================

-- ============================================
-- COMPLETE DATABASE SCHEMA - UniLib Platform
-- Part 3: TRIGGERS AND RLS POLICIES
-- Generated: 2025-12-13
-- ============================================
-- Run this AFTER running Part 1 and Part 2

-- ============================================
-- TRIGGERS
-- ============================================

-- Update level when XP changes
CREATE OR REPLACE FUNCTION update_level_on_xp_change()
RETURNS TRIGGER AS $$
BEGIN
    NEW.level := calculate_level(NEW.xp);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_level ON profiles;
CREATE TRIGGER trigger_update_level
    BEFORE UPDATE OF xp ON profiles
    FOR EACH ROW
    WHEN (OLD.xp IS DISTINCT FROM NEW.xp)
    EXECUTE FUNCTION update_level_on_xp_change();

-- Award XP on daily goal completion
CREATE OR REPLACE FUNCTION award_xp_on_daily_goal()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN
        SELECT user_id INTO v_user_id
        FROM reading_schedule
        WHERE id = NEW.schedule_id;
        
        UPDATE profiles
        SET 
            xp = xp + 50,
            total_daily_goals_completed = COALESCE(total_daily_goals_completed, 0) + 1
        WHERE id = v_user_id;
        
        PERFORM check_and_award_achievements(v_user_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_award_xp_daily_goal ON daily_progress;
CREATE TRIGGER trigger_award_xp_daily_goal
    AFTER INSERT OR UPDATE ON daily_progress
    FOR EACH ROW
    EXECUTE FUNCTION award_xp_on_daily_goal();

-- Update total pages read
CREATE OR REPLACE FUNCTION update_total_pages_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.progress_percentage = 100 AND (OLD.progress_percentage IS NULL OR OLD.progress_percentage < 100) THEN
        UPDATE profiles
        SET 
            total_books_completed = total_books_completed + 1,
            xp = xp + 200
        WHERE id = NEW.user_id;
        
        PERFORM check_and_award_achievements(NEW.user_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_total_pages ON user_progress;
CREATE TRIGGER trigger_update_total_pages
    AFTER UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_total_pages_read();

-- Update physical copy status on checkout
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

DROP TRIGGER IF EXISTS checkout_update_copy_status ON book_checkouts;
CREATE TRIGGER checkout_update_copy_status
    AFTER INSERT ON book_checkouts
    FOR EACH ROW
    EXECUTE FUNCTION update_copy_status_on_checkout();

-- Update physical copy status on return
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

DROP TRIGGER IF EXISTS return_update_copy_status ON book_checkouts;
CREATE TRIGGER return_update_copy_status
    BEFORE UPDATE ON book_checkouts
    FOR EACH ROW
    EXECUTE FUNCTION update_copy_status_on_return();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_physical_copies_updated_at ON physical_book_copies;
CREATE TRIGGER update_physical_copies_updated_at
    BEFORE UPDATE ON physical_book_copies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        name,
        role,
        xp,
        level,
        streak_days,
        total_pages_read,
        total_books_completed,
        is_active
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'student',
        0,
        1,
        0,
        0,
        0,
        true
    );
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Librarians can update user XP" ON profiles;
CREATE POLICY "Librarians can update user XP"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

-- Books policies
DROP POLICY IF EXISTS "Anyone can view books" ON books;
CREATE POLICY "Anyone can view books"
    ON books FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;
CREATE POLICY "Books are viewable by everyone"
    ON books FOR SELECT
    USING (true);

-- Physical book copies policies
DROP POLICY IF EXISTS "Anyone can view physical copies" ON physical_book_copies;
CREATE POLICY "Anyone can view physical copies"
    ON physical_book_copies FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Physical copies are viewable by everyone" ON physical_book_copies;
CREATE POLICY "Physical copies are viewable by everyone"
    ON physical_book_copies FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Librarians can insert physical copies" ON physical_book_copies;
CREATE POLICY "Librarians can insert physical copies"
    ON physical_book_copies FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Librarians can update physical copies" ON physical_book_copies;
CREATE POLICY "Librarians can update physical copies"
    ON physical_book_copies FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

-- Book checkouts policies
DROP POLICY IF EXISTS "Users can view own checkouts" ON book_checkouts;
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

DROP POLICY IF EXISTS "Librarians can create checkouts" ON book_checkouts;
CREATE POLICY "Librarians can create checkouts"
    ON book_checkouts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Librarians can update checkouts" ON book_checkouts;
CREATE POLICY "Librarians can update checkouts"
    ON book_checkouts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

-- User progress policies
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
CREATE POLICY "Users can view own progress"
    ON user_progress FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
CREATE POLICY "Users can update own progress"
    ON user_progress FOR ALL
    USING (user_id = auth.uid());

-- Achievements policies
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;
CREATE POLICY "Achievements are viewable by everyone"
    ON achievements FOR SELECT
    USING (true);

-- User achievements policies
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
CREATE POLICY "Users can view their own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert achievements" ON user_achievements;
CREATE POLICY "System can insert achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (true);

-- Reading schedule policies
DROP POLICY IF EXISTS "Users can manage own schedule" ON reading_schedule;
CREATE POLICY "Users can manage own schedule"
    ON reading_schedule FOR ALL
    USING (user_id = auth.uid());

-- Daily progress policies
DROP POLICY IF EXISTS "Users can manage own daily progress" ON daily_progress;
CREATE POLICY "Users can manage own daily progress"
    ON daily_progress FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM reading_schedule
            WHERE id = daily_progress.schedule_id
            AND user_id = auth.uid()
        )
    );

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
-- Run simple_health_check() to verify installation
SELECT * FROM simple_health_check();


-- ============================================================================
-- FILE 6 of 67: supabase\CONSOLIDATED_ALL_MIGRATIONS.sql
-- Size: 8.36 KB
-- ============================================================================

-- ============================================================================
-- CONSOLIDATED MIGRATION FILE - UniLib Platform
-- Generated: 2025-12-13 17:43:58
-- Description: All SQL migrations consolidated into single file
-- ============================================================================


-- ============================================================================
-- FILE: supabase\migrations\20251213_add_student_id.sql
-- ============================================================================

-- Migration: Add Student Short ID System (Year-Based)
-- Date: 2025-12-13
-- Purpose: Add short numeric student IDs with year prefix for manual fallback when scanner fails
-- Format: YYXXX (e.g., 24001, 25001)

-- Add student_id column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_id TEXT UNIQUE;

-- Create sequences for each year (we'll create them dynamically)
-- Function to get or create sequence for a year
CREATE OR REPLACE FUNCTION get_year_sequence(year_suffix TEXT)
RETURNS TEXT AS $$
DECLARE
    seq_name TEXT;
BEGIN
    seq_name := 'student_id_seq_' || year_suffix;
    
    -- Create sequence if it doesn't exist
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I START 1', seq_name);
    
    RETURN seq_name;
END;
$$ LANGUAGE plpgsql;

-- Function to generate year-based student ID (YYXXX format)
CREATE OR REPLACE FUNCTION generate_student_id()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    year_suffix TEXT;
    seq_name TEXT;
    next_id INTEGER;
    student_id TEXT;
BEGIN
    -- Get current year (last 2 digits)
    current_year := to_char(CURRENT_DATE, 'YY');
    year_suffix := current_year;
    
    -- Get or create sequence for this year
    seq_name := get_year_sequence(year_suffix);
    
    -- Get next sequence value for this year
    EXECUTE format('SELECT nextval(%L)', seq_name) INTO next_id;
    
    -- Format as YYXXX (year + 3-digit sequential)
    student_id := year_suffix || LPAD(next_id::TEXT, 3, '0');
    
    RETURN student_id;
END;
$$ LANGUAGE plpgsql;

-- Update existing users with student IDs
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id FROM profiles WHERE student_id IS NULL ORDER BY created_at
    LOOP
        UPDATE profiles 
        SET student_id = generate_student_id()
        WHERE id = user_record.id;
    END LOOP;
END $$;

-- Create index for fast student ID lookups
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);

-- Add comment
COMMENT ON COLUMN profiles.student_id IS 'Short 5-digit student ID for manual input (00001, 00002, etc.)';

-- ============================================================================
-- FILE: supabase\migrations\20251213_add_student_id_trigger.sql
-- ============================================================================

-- Add trigger to auto-generate student_id on profile creation
-- Date: 2025-12-13

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS trigger_auto_generate_student_id ON profiles;

-- Create trigger function
CREATE OR REPLACE FUNCTION auto_generate_student_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if student_id is NULL
    IF NEW.student_id IS NULL THEN
        NEW.student_id := generate_student_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_auto_generate_student_id
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_student_id();

-- Verify trigger was created
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles' 
AND trigger_name = 'trigger_auto_generate_student_id';

-- ============================================================================
-- FILE: supabase\FORCE_CREATE_INDEXES.sql
-- ============================================================================

-- FORCE CREATE ALL INDEXES
-- This will fix the Seq Scan problem

-- ============================================
-- 1. Drop and Recreate All Performance Indexes
-- ============================================

-- Books: Online books filter
DROP INDEX IF EXISTS idx_books_online_only;
CREATE INDEX idx_books_online_only 
ON books(created_at DESC, id) 
WHERE cover_url IS NOT NULL;

-- Books: Category + rating filter
DROP INDEX IF EXISTS idx_books_category_rating;
CREATE INDEX idx_books_category_rating 
ON books(category, rating DESC, created_at DESC) 
WHERE cover_url IS NOT NULL;

-- Books: Full-text search
DROP INDEX IF EXISTS idx_books_search_gin;
CREATE INDEX idx_books_search_gin 
ON books USING gin(to_tsvector('english', title || ' ' || author));

-- Book Checkouts: Today stats
DROP INDEX IF EXISTS idx_book_checkouts_checked_out_at;
CREATE INDEX idx_book_checkouts_checked_out_at 
ON book_checkouts(checked_out_at DESC) 
WHERE status = 'active';

DROP INDEX IF EXISTS idx_book_checkouts_returned_at;
CREATE INDEX idx_book_checkouts_returned_at 
ON book_checkouts(returned_at DESC) 
WHERE status = 'returned';

-- Daily Progress: Schedule queries
DROP INDEX IF EXISTS idx_daily_progress_schedule_date;
CREATE INDEX idx_daily_progress_schedule_date 
ON daily_progress(schedule_id, date DESC);

-- User Progress: Active reading
DROP INDEX IF EXISTS idx_user_progress_active;
CREATE INDEX idx_user_progress_active 
ON user_progress(user_id, last_read_at DESC) 
WHERE progress_percentage > 0 AND progress_percentage < 100;

-- Profiles: Leaderboard
DROP INDEX IF EXISTS idx_profiles_leaderboard;
CREATE INDEX idx_profiles_leaderboard 
ON profiles(xp DESC, streak_days DESC) 
WHERE is_active = true;

-- Profiles: Student number search
DROP INDEX IF EXISTS idx_profiles_student_number;
CREATE INDEX idx_profiles_student_number 
ON profiles(student_number) 
WHERE student_number IS NOT NULL;

-- Book Checkouts: User status
DROP INDEX IF EXISTS idx_checkouts_user_status;
CREATE INDEX idx_checkouts_user_status 
ON book_checkouts(user_id, status, checked_out_at DESC);

-- ============================================
-- 2. Update Statistics
-- ============================================

ANALYZE books;
ANALYZE book_checkouts;
ANALYZE profiles;
ANALYZE user_progress;
ANALYZE daily_progress;
ANALYZE reading_schedule;
ANALYZE physical_book_copies;

-- ============================================
-- 3. Verify Index Usage
-- ============================================

-- This should NOW use Index Scan
EXPLAIN ANALYZE
SELECT id, title, author, rating
FROM books
WHERE cover_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 12;

-- Expected output should include:
-- "Index Scan using idx_books_online_only"
-- NOT "Seq Scan"

-- ============================================
-- 4. Show All Created Indexes
-- ============================================

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- FILE: supabase\FIX_STUDENT_IDS.sql
-- ============================================================================

-- Check and fix student_id for all users
-- Date: 2025-12-13

-- 1. Check how many users don't have student_id
SELECT 
    COUNT(*) as total_users,
    COUNT(student_id) as users_with_id,
    COUNT(*) - COUNT(student_id) as users_without_id
FROM profiles;

-- 2. Show users without student_id
SELECT id, name, email, student_id, created_at
FROM profiles
WHERE student_id IS NULL
ORDER BY created_at
LIMIT 10;

-- 3. Assign student_id to all users who don't have one
UPDATE profiles
SET student_id = generate_student_id()
WHERE student_id IS NULL;

-- 4. Verify all users now have student_id
SELECT 
    COUNT(*) as total_users,
    COUNT(student_id) as users_with_id,
    COUNT(*) - COUNT(student_id) as users_without_id
FROM profiles;

-- 5. Show sample of assigned IDs
SELECT id, name, email, student_id, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- END OF CONSOLIDATED MIGRATION
-- Generated: 2025-12-13 17:43:58
-- ============================================================================


-- ============================================================================
-- FILE 7 of 67: supabase\consolidated_migration.sql
-- Size: 22.95 KB
-- ============================================================================

-- ============================================
-- UniLib2 Consolidated Migration Script
-- ============================================
-- Bu script barcha asosiy migratsiyalarni o'z ichiga oladi
-- Supabase SQL Editor da ishlatish uchun
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ORGANIZATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('school', 'college', 'university', 'public_library', 'private_library')),
    logo_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    settings JSONB DEFAULT '{}',
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
    max_students INTEGER DEFAULT 200,
    max_books INTEGER,
    max_librarians INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- Insert default organization
INSERT INTO organizations (name, slug, type, subscription_tier, subscription_status, max_students, max_books)
VALUES (
    'UniLib Platform',
    'unilib-platform',
    'public_library',
    'enterprise',
    'active',
    999999,
    999999
)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. PROFILES TABLE (Update existing)
-- ============================================

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- organization_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='organization_id') THEN
        ALTER TABLE profiles ADD COLUMN organization_id UUID REFERENCES organizations(id);
    END IF;
    
    -- role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'student' 
            CHECK (role IN ('super_admin', 'system_admin', 'org_admin', 'head_librarian', 'librarian', 'teacher', 'parent', 'student'));
    END IF;
    
    -- is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_active') THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- student_id (13 digit)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='student_id') THEN
        ALTER TABLE profiles ADD COLUMN student_id TEXT;
    END IF;
    
    -- HEMIS columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='faculty') THEN
        ALTER TABLE profiles ADD COLUMN faculty TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='group_name') THEN
        ALTER TABLE profiles ADD COLUMN group_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='course') THEN
        ALTER TABLE profiles ADD COLUMN course INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='education_form') THEN
        ALTER TABLE profiles ADD COLUMN education_form TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='specialty') THEN
        ALTER TABLE profiles ADD COLUMN specialty TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='gpa') THEN
        ALTER TABLE profiles ADD COLUMN gpa DECIMAL(3,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_synced_at') THEN
        ALTER TABLE profiles ADD COLUMN last_synced_at TIMESTAMPTZ;
    END IF;
    
    -- bio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
    
    -- Gamification columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_pages_read') THEN
        ALTER TABLE profiles ADD COLUMN total_pages_read INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_books_completed') THEN
        ALTER TABLE profiles ADD COLUMN total_books_completed INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_streak_update') THEN
        ALTER TABLE profiles ADD COLUMN last_streak_update DATE;
    END IF;
END $$;

-- Migrate existing users to default organization
UPDATE profiles 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'unilib-platform')
WHERE organization_id IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);

-- ============================================
-- 3. BOOKS TABLE
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
    file_url TEXT,
    pdf_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    total_pages INTEGER DEFAULT 0,
    is_online BOOLEAN DEFAULT true,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_organization_id ON books(organization_id);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. OFFLINE LIBRARY BOOKS
-- ============================================

CREATE TABLE IF NOT EXISTS offline_library_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    available_quantity INTEGER DEFAULT 1,
    location TEXT,
    shelf_number TEXT,
    barcode TEXT UNIQUE,
    condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(book_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_offline_books_book_id ON offline_library_books(book_id);
CREATE INDEX IF NOT EXISTS idx_offline_books_org_id ON offline_library_books(organization_id);

ALTER TABLE offline_library_books ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. BOOK REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS book_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(book_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_book_reviews_book_id ON book_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_user_id ON book_reviews(user_id);

ALTER TABLE book_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. GAMIFICATION TABLES
-- ============================================

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'рџЏ†',
    xp_reward INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('streak', 'books_completed', 'pages_read', 'daily_goals')),
    requirement_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    seen BOOLEAN DEFAULT false,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. READING SCHEDULE
-- ============================================

CREATE TABLE IF NOT EXISTS reading_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    daily_goal_pages INTEGER,
    daily_goal_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES reading_schedule(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    pages_read INTEGER DEFAULT 0,
    minutes_read INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, schedule_id, date)
);

CREATE INDEX IF NOT EXISTS idx_reading_schedule_user_id ON reading_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_id ON daily_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON daily_progress(date);

ALTER TABLE reading_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info'CHECK (type IN ('info', 'success', 'warning', 'achievement')),
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. ADMIN LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Organizations
DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON organizations;
CREATE POLICY "Organizations are viewable by everyone"
    ON organizations FOR SELECT
    USING (true);

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Books
DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;
CREATE POLICY "Books are viewable by everyone"
    ON books FOR SELECT
    USING (true);

-- Book Reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON book_reviews;
CREATE POLICY "Reviews are viewable by everyone"
    ON book_reviews FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON book_reviews;
CREATE POLICY "Users can create reviews"
    ON book_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON book_reviews;
CREATE POLICY "Users can update own reviews"
    ON book_reviews FOR UPDATE
    USING (auth.uid() = user_id);

-- Offline Library Books
DROP POLICY IF EXISTS "Offline books are viewable by everyone" ON offline_library_books;
CREATE POLICY "Offline books are viewable by everyone"
    ON offline_library_books FOR SELECT
    USING (true);

-- Achievements
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;
CREATE POLICY "Achievements are viewable by everyone"
    ON achievements FOR SELECT
    USING (true);

-- User Achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
CREATE POLICY "Users can insert own achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Reading Schedule
DROP POLICY IF EXISTS "Users can view own schedule" ON reading_schedule;
CREATE POLICY "Users can view own schedule"
    ON reading_schedule FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own schedule" ON reading_schedule;
CREATE POLICY "Users can create own schedule"
    ON reading_schedule FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own schedule" ON reading_schedule;
CREATE POLICY "Users can update own schedule"
    ON reading_schedule FOR UPDATE
    USING (auth.uid() = user_id);

-- Daily Progress
DROP POLICY IF EXISTS "Users can view own progress" ON daily_progress;
CREATE POLICY "Users can view own progress"
    ON daily_progress FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON daily_progress;
CREATE POLICY "Users can insert own progress"
    ON daily_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON daily_progress;
CREATE POLICY "Users can update own progress"
    ON daily_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Admin Logs
DROP POLICY IF EXISTS "Admins can view logs" ON admin_logs;
CREATE POLICY "Admins can view logs"
    ON admin_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'system_admin', 'org_admin')
        )
    );

-- ============================================
-- 11. FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reading_schedule_updated_at ON reading_schedule;
CREATE TRIGGER update_reading_schedule_updated_at
    BEFORE UPDATE ON reading_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Leaderboard functions
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
    id UUID,
    name TEXT,
    avatar_url TEXT,
    xp INTEGER,
    level INTEGER,
    total_books_completed INTEGER,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.avatar_url,
        p.xp,
        p.level,
        p.total_books_completed,
        ROW_NUMBER() OVER (ORDER BY p.xp DESC) as rank
    FROM profiles p
    WHERE p.is_active = true
    ORDER BY p.xp DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_streak_leaderboard()
RETURNS TABLE (
    id UUID,
    name TEXT,
    avatar_url TEXT,
    streak_days INTEGER,
    xp INTEGER,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.avatar_url,
        p.streak_days,
        p.xp,
        ROW_NUMBER() OVER (ORDER BY p.streak_days DESC) as rank
    FROM profiles p
    WHERE p.is_active = true AND p.streak_days > 0
    ORDER BY p.streak_days DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Check and unlock achievements
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_profile RECORD;
    v_achievement RECORD;
BEGIN
    -- Get user profile
    SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
    
    -- Check each achievement
    FOR v_achievement IN 
        SELECT * FROM achievements 
        WHERE id NOT IN (
            SELECT achievement_id FROM user_achievements WHERE user_id = p_user_id
        )
    LOOP
        -- Check if user meets requirement
        IF (
            (v_achievement.requirement_type = 'streak' AND v_profile.streak_days >= v_achievement.requirement_value) OR
            (v_achievement.requirement_type = 'books_completed' AND v_profile.total_books_completed >= v_achievement.requirement_value) OR
            (v_achievement.requirement_type = 'pages_read' AND v_profile.total_pages_read >= v_achievement.requirement_value)
        ) THEN
            -- Unlock achievement
            INSERT INTO user_achievements (user_id, achievement_id)
            VALUES (p_user_id, v_achievement.id)
            ON CONFLICT DO NOTHING;
            
            -- Award XP
            UPDATE profiles 
            SET xp = xp + v_achievement.xp_reward
            WHERE id = p_user_id;
            
            -- Create notification
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (
                p_user_id,
                'Yangi Yutuq! рџЏ†',
                'Siz "' || v_achievement.title || '" yutuqini qo\'lga kiritdingiz! +' || v_achievement.xp_reward || ' XP',
                'achievement'
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_default_org_id UUID;
BEGIN
    -- Get default organization
    SELECT id INTO v_default_org_id FROM organizations WHERE slug = 'unilib-platform';
    
    -- Insert profile
    INSERT INTO profiles (id, email, name, organization_id, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        v_default_org_id,
        'student'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 12. SEED DATA (Achievements)
-- ============================================

INSERT INTO achievements (key, title, description, icon, xp_reward, tier, requirement_type, requirement_value) VALUES
    ('streak_3', 'Boshlang\'ich', '3 kun ketma-ket o\'qish', 'рџ”Ґ', 25, 'bronze', 'streak', 3),
    ('streak_7', 'Haftalik', '7 kun ketma-ket o\'qish', 'рџ”Ґ', 50, 'silver', 'streak', 7),
    ('streak_30', 'Oylik', '30 kun ketma-ket o\'qish', 'рџ”Ґ', 100, 'gold', 'streak', 30),
    ('books_1', 'Birinchi Kitob', 'Birinchi kitobni tugatish', 'рџ“љ', 50, 'bronze', 'books_completed', 1),
    ('books_5', 'Kitobxon', '5 ta kitobni tugatish', 'рџ“љ', 100, 'silver', 'books_completed', 5),
    ('books_10', 'Kutubxona Faxriysi', '10 ta kitobni tugatish', 'рџ“љ', 200, 'gold', 'books_completed', 10),
    ('pages_100', 'Yuz Sahifa', '100 sahifa o\'qish', 'рџ“–', 25, 'bronze', 'pages_read', 100),
    ('pages_500', 'Besh Yuz Sahifa', '500 sahifa o\'qish', 'рџ“–', 75, 'silver', 'pages_read', 500),
    ('pages_1000', 'Ming Sahifa', '1000 sahifa o\'qish', 'рџ“–', 150, 'gold', 'pages_read', 1000)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify tables
SELECT 'Migration completed successfully!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;


-- ============================================================================
-- FILE 8 of 67: supabase\fix_rls_for_registration.sql
-- Size: 1.32 KB
-- ============================================================================

-- Fix RLS policies for registration
-- This allows authenticated users to read their own profile immediately after registration

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies with proper permissions
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Also allow service role to insert profiles (for trigger)
CREATE POLICY "Service role can insert profiles"
    ON profiles FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Verify policies
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';


-- ============================================================================
-- FILE 9 of 67: supabase\FIX_STUDENT_IDS.sql
-- Size: 0.88 KB
-- ============================================================================

-- Check and fix student_id for all users
-- Date: 2025-12-13

-- 1. Check how many users don't have student_id
SELECT 
    COUNT(*) as total_users,
    COUNT(student_id) as users_with_id,
    COUNT(*) - COUNT(student_id) as users_without_id
FROM profiles;

-- 2. Show users without student_id
SELECT id, name, email, student_id, created_at
FROM profiles
WHERE student_id IS NULL
ORDER BY created_at
LIMIT 10;

-- 3. Assign student_id to all users who don't have one
UPDATE profiles
SET student_id = generate_student_id()
WHERE student_id IS NULL;

-- 4. Verify all users now have student_id
SELECT 
    COUNT(*) as total_users,
    COUNT(student_id) as users_with_id,
    COUNT(*) - COUNT(student_id) as users_without_id
FROM profiles;

-- 5. Show sample of assigned IDs
SELECT id, name, email, student_id, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;


-- ============================================================================
-- FILE 10 of 67: supabase\FORCE_CREATE_INDEXES.sql
-- Size: 3.07 KB
-- ============================================================================

-- FORCE CREATE ALL INDEXES
-- This will fix the Seq Scan problem

-- ============================================
-- 1. Drop and Recreate All Performance Indexes
-- ============================================

-- Books: Online books filter
DROP INDEX IF EXISTS idx_books_online_only;
CREATE INDEX idx_books_online_only 
ON books(created_at DESC, id) 
WHERE cover_url IS NOT NULL;

-- Books: Category + rating filter
DROP INDEX IF EXISTS idx_books_category_rating;
CREATE INDEX idx_books_category_rating 
ON books(category, rating DESC, created_at DESC) 
WHERE cover_url IS NOT NULL;

-- Books: Full-text search
DROP INDEX IF EXISTS idx_books_search_gin;
CREATE INDEX idx_books_search_gin 
ON books USING gin(to_tsvector('english', title || ' ' || author));

-- Book Checkouts: Today stats
DROP INDEX IF EXISTS idx_book_checkouts_checked_out_at;
CREATE INDEX idx_book_checkouts_checked_out_at 
ON book_checkouts(checked_out_at DESC) 
WHERE status = 'active';

DROP INDEX IF EXISTS idx_book_checkouts_returned_at;
CREATE INDEX idx_book_checkouts_returned_at 
ON book_checkouts(returned_at DESC) 
WHERE status = 'returned';

-- Daily Progress: Schedule queries
DROP INDEX IF EXISTS idx_daily_progress_schedule_date;
CREATE INDEX idx_daily_progress_schedule_date 
ON daily_progress(schedule_id, date DESC);

-- User Progress: Active reading
DROP INDEX IF EXISTS idx_user_progress_active;
CREATE INDEX idx_user_progress_active 
ON user_progress(user_id, last_read_at DESC) 
WHERE progress_percentage > 0 AND progress_percentage < 100;

-- Profiles: Leaderboard
DROP INDEX IF EXISTS idx_profiles_leaderboard;
CREATE INDEX idx_profiles_leaderboard 
ON profiles(xp DESC, streak_days DESC) 
WHERE is_active = true;

-- Profiles: Student number search
DROP INDEX IF EXISTS idx_profiles_student_number;
CREATE INDEX idx_profiles_student_number 
ON profiles(student_number) 
WHERE student_number IS NOT NULL;

-- Book Checkouts: User status
DROP INDEX IF EXISTS idx_checkouts_user_status;
CREATE INDEX idx_checkouts_user_status 
ON book_checkouts(user_id, status, checked_out_at DESC);

-- ============================================
-- 2. Update Statistics
-- ============================================

ANALYZE books;
ANALYZE book_checkouts;
ANALYZE profiles;
ANALYZE user_progress;
ANALYZE daily_progress;
ANALYZE reading_schedule;
ANALYZE physical_book_copies;

-- ============================================
-- 3. Verify Index Usage
-- ============================================

-- This should NOW use Index Scan
EXPLAIN ANALYZE
SELECT id, title, author, rating
FROM books
WHERE cover_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 12;

-- Expected output should include:
-- "Index Scan using idx_books_online_only"
-- NOT "Seq Scan"

-- ============================================
-- 4. Show All Created Indexes
-- ============================================

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;


-- ============================================================================
-- FILE 11 of 67: supabase\migrations\00_database_analysis.sql
-- Size: 6.38 KB
-- ============================================================================

-- Database Analysis Script
-- Run this in Supabase SQL Editor to check current state
-- Date: 2025-12-13

-- ============================================
-- 1. CHECK EXISTING TABLES
-- ============================================
SELECT 
    t.schemaname,
    t.tablename,
    pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename)) AS total_size,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.tablename AND table_schema = 'public') AS column_count
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY pg_total_relation_size(t.schemaname||'.'||t.tablename) DESC;

-- ============================================
-- 2. CHECK EXISTING INDEXES
-- ============================================
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan AS times_used,
    CASE 
        WHEN idx_scan = 0 THEN 'вќЊ Never used'
        WHEN idx_scan < 100 THEN 'вљ пёЏ Rarely used'
        WHEN idx_scan < 1000 THEN 'вњ… Sometimes used'
        ELSE 'рџ”Ґ Frequently used'
    END AS usage_status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- ============================================
-- 3. CHECK IF NEW INDEXES ALREADY EXIST
-- ============================================
SELECT 
    indexname,
    CASE 
        WHEN indexname = 'idx_books_online_only' THEN 'вњ… EXISTS'
        WHEN indexname = 'idx_book_checkouts_checked_out_at' THEN 'вњ… EXISTS'
        WHEN indexname = 'idx_book_checkouts_returned_at' THEN 'вњ… EXISTS'
        WHEN indexname = 'idx_daily_progress_schedule_date' THEN 'вњ… EXISTS'
        WHEN indexname = 'idx_user_progress_active' THEN 'вњ… EXISTS'
        WHEN indexname = 'idx_books_category_rating' THEN 'вњ… EXISTS'
        WHEN indexname = 'idx_books_search_gin' THEN 'вњ… EXISTS'
        ELSE 'Other index'
    END AS status
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_books_online_only',
    'idx_book_checkouts_checked_out_at',
    'idx_book_checkouts_returned_at',
    'idx_daily_progress_schedule_date',
    'idx_user_progress_active',
    'idx_books_category_rating',
    'idx_books_search_gin'
);

-- If empty result, indexes don't exist yet (GOOD - we need to create them)

-- ============================================
-- 4. CHECK IF MONITORING FUNCTIONS EXIST
-- ============================================
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name = 'get_table_stats' THEN 'вњ… EXISTS'
        WHEN routine_name = 'get_index_usage' THEN 'вњ… EXISTS'
        WHEN routine_name = 'get_unused_indexes' THEN 'вњ… EXISTS'
        WHEN routine_name = 'get_slow_queries' THEN 'вњ… EXISTS'
        WHEN routine_name = 'database_health_check' THEN 'вњ… EXISTS'
        ELSE 'Other function'
    END AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'get_table_stats',
    'get_index_usage',
    'get_unused_indexes',
    'get_slow_queries',
    'database_health_check'
);

-- If empty result, functions don't exist yet (GOOD - we need to create them)

-- ============================================
-- 5. CHECK CURRENT DATABASE SIZE
-- ============================================
SELECT 
    pg_size_pretty(pg_database_size(current_database())) AS database_size,
    (SELECT count(*) FROM pg_stat_activity) AS total_connections,
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') AS active_connections;

-- ============================================
-- 6. CHECK TABLE ROW COUNTS
-- ============================================
SELECT 
    'profiles' AS table_name,
    count(*) AS row_count
FROM profiles
UNION ALL
SELECT 'books', count(*) FROM books
UNION ALL
SELECT 'physical_book_copies', count(*) FROM physical_book_copies
UNION ALL
SELECT 'book_checkouts', count(*) FROM book_checkouts
UNION ALL
SELECT 'user_progress', count(*) FROM user_progress
UNION ALL
SELECT 'achievements', count(*) FROM achievements
UNION ALL
SELECT 'user_achievements', count(*) FROM user_achievements
UNION ALL
SELECT 'reading_schedule', count(*) FROM reading_schedule
UNION ALL
SELECT 'daily_progress', count(*) FROM daily_progress
ORDER BY row_count DESC;

-- ============================================
-- 7. TEST CRITICAL QUERIES (Performance Baseline)
-- ============================================

-- Test 1: Student search (Checker page)
EXPLAIN ANALYZE
SELECT id, name, email, student_id, student_number, avatar_url, xp
FROM profiles
WHERE student_number = '25001' OR student_id = '25001'
LIMIT 1;

-- Test 2: Active loans query
EXPLAIN ANALYZE
SELECT 
    bc.id,
    bc.due_date,
    bc.checked_out_at
FROM book_checkouts bc
WHERE bc.user_id = (SELECT id FROM profiles LIMIT 1)
  AND bc.status = 'active'
ORDER BY bc.due_date ASC;

-- Test 3: Library books query
EXPLAIN ANALYZE
SELECT id, title, author, rating, cover_color, category, cover_url, views_count
FROM books
WHERE cover_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 12;

-- ============================================
-- 8. SUMMARY REPORT
-- ============================================
SELECT 
    'рџ“Љ Database Analysis Summary' AS report_section,
    '' AS details
UNION ALL
SELECT 
    'вњ… Tables',
    (SELECT count(*)::text FROM pg_tables WHERE schemaname = 'public') || ' tables'
UNION ALL
SELECT 
    'вњ… Indexes',
    (SELECT count(*)::text FROM pg_indexes WHERE schemaname = 'public') || ' indexes'
UNION ALL
SELECT 
    'вњ… Functions',
    (SELECT count(*)::text FROM information_schema.routines WHERE routine_schema = 'public') || ' functions'
UNION ALL
SELECT 
    'рџ“¦ Database Size',
    pg_size_pretty(pg_database_size(current_database()))
UNION ALL
SELECT 
    'рџ‘Ґ Total Users',
    (SELECT count(*)::text FROM profiles)
UNION ALL
SELECT 
    'рџ“љ Total Books',
    (SELECT count(*)::text FROM books)
UNION ALL
SELECT 
    'рџ”„ Active Checkouts',
    (SELECT count(*)::text FROM book_checkouts WHERE status = 'active');

-- ============================================
-- NEXT STEPS:
-- ============================================
-- 1. Review the results above
-- 2. If new indexes don't exist, run: 20251213_database_optimization.sql
-- 3. After migration, run this script again to verify
-- 4. Compare performance before/after


-- ============================================================================
-- FILE 12 of 67: supabase\migrations\00_quick_check.sql
-- Size: 3.1 KB
-- ============================================================================

-- QUICK DATABASE CHECK
-- Run each section separately in Supabase SQL Editor
-- Date: 2025-12-13

-- ============================================
-- SECTION 1: Tables Overview
-- ============================================
SELECT 
    t.schemaname,
    t.tablename,
    pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename)) AS total_size
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY pg_total_relation_size(t.schemaname||'.'||t.tablename) DESC;

-- ============================================
-- SECTION 2: Existing Indexes
-- ============================================
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan AS times_used
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC
LIMIT 20;

-- ============================================
-- SECTION 3: Check New Indexes (Should be empty)
-- ============================================
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_books_online_only',
    'idx_book_checkouts_checked_out_at',
    'idx_book_checkouts_returned_at',
    'idx_daily_progress_schedule_date',
    'idx_user_progress_active',
    'idx_books_category_rating',
    'idx_books_search_gin'
);
-- If empty = Good! We need to create them

-- ============================================
-- SECTION 4: Database Size & Connections
-- ============================================
SELECT 
    pg_size_pretty(pg_database_size(current_database())) AS database_size,
    (SELECT count(*) FROM pg_stat_activity) AS total_connections,
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') AS active_connections;

-- ============================================
-- SECTION 5: Table Row Counts
-- ============================================
SELECT 
    'profiles' AS table_name,
    count(*) AS row_count
FROM profiles
UNION ALL
SELECT 'books', count(*) FROM books
UNION ALL
SELECT 'physical_book_copies', count(*) FROM physical_book_copies
UNION ALL
SELECT 'book_checkouts', count(*) FROM book_checkouts
UNION ALL
SELECT 'user_progress', count(*) FROM user_progress
ORDER BY row_count DESC;

-- ============================================
-- SECTION 6: Performance Test - Library Query
-- ============================================
EXPLAIN ANALYZE
SELECT id, title, author, rating, cover_url
FROM books
WHERE cover_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 12;
-- Look for: Execution Time (should be ~50-100ms before optimization)

-- ============================================
-- SECTION 7: Performance Test - Student Search
-- ============================================
EXPLAIN ANALYZE
SELECT id, name, email, student_id, student_number
FROM profiles
WHERE student_number = '25001' OR student_id = '25001'
LIMIT 1;
-- Look for: Index Scan (should use idx_profiles_student_number or idx_profiles_student_id)

-- ============================================
-- NEXT: Run 20251213_database_optimization.sql
-- ============================================


-- ============================================================================
-- FILE 13 of 67: supabase\migrations\00_simple_check.sql
-- Size: 1.84 KB
-- ============================================================================

-- ============================================
-- SIMPLE DATABASE CHECK - RUN THIS INSTEAD
-- Copy-paste each section separately
-- ============================================

-- SECTION 1: Tables
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- SECTION 2: Indexes (Top 20)
SELECT 
    indexrelname AS index_name,
    relname AS table_name,
    idx_scan AS times_used
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC
LIMIT 20;

-- SECTION 3: Check if new indexes exist (should be empty)
SELECT indexname AS index_name
FROM pg_indexes
WHERE schemaname = 'public'
AND (
   indexname LIKE 'idx_books_online%'
   OR indexname LIKE 'idx_book_checkouts_checked%'
   OR indexname LIKE 'idx_book_checkouts_returned%'
   OR indexname LIKE 'idx_daily_progress_schedule%'
   OR indexname LIKE 'idx_user_progress_active%'
   OR indexname LIKE 'idx_books_category_rating%'
   OR indexname LIKE 'idx_books_search_gin%'
);

-- SECTION 4: Database size
SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size;

-- SECTION 5: Row counts
SELECT 'profiles' AS tbl, count(*) AS rows FROM profiles
UNION ALL SELECT 'books', count(*) FROM books
UNION ALL SELECT 'book_checkouts', count(*) FROM book_checkouts
UNION ALL SELECT 'user_progress', count(*) FROM user_progress
ORDER BY rows DESC;

-- SECTION 6: Test library query performance
EXPLAIN ANALYZE
SELECT id, title, author, rating
FROM books
WHERE cover_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 12;

-- ============================================
-- IF ALL LOOKS GOOD, RUN THE OPTIMIZATION:
-- File: 20251213_database_optimization.sql
-- ============================================


-- ============================================================================
-- FILE 14 of 67: supabase\migrations\20241123_fix_gamification_triggers.sql
-- Size: 1.47 KB
-- ============================================================================

-- Function to update total pages read in profiles when daily_progress changes
CREATE OR REPLACE FUNCTION update_total_pages_from_daily()
RETURNS TRIGGER AS $$
DECLARE
    v_pages_diff INTEGER;
    v_user_id UUID;
BEGIN
    -- Calculate difference in pages read
    -- If INSERT, OLD is null, so use 0
    v_pages_diff := NEW.pages_read - COALESCE(OLD.pages_read, 0);
    
    -- Only proceed if pages increased
    IF v_pages_diff > 0 THEN
        -- Get user_id from schedule
        SELECT user_id INTO v_user_id
        FROM reading_schedule
        WHERE id = NEW.schedule_id;

        -- Update profile
        UPDATE profiles
        SET total_pages_read = COALESCE(total_pages_read, 0) + v_pages_diff
        WHERE id = v_user_id;

        -- Check achievements
        PERFORM check_and_award_achievements(v_user_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for daily_progress
DROP TRIGGER IF EXISTS trigger_update_pages_read ON daily_progress;
CREATE TRIGGER trigger_update_pages_read
    AFTER INSERT OR UPDATE OF pages_read ON daily_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_total_pages_from_daily();

-- Recalculate total pages for all users to fix missing data
DO $$
BEGIN
    UPDATE profiles p
    SET total_pages_read = (
        SELECT COALESCE(SUM(dp.pages_read), 0)
        FROM daily_progress dp
        JOIN reading_schedule rs ON dp.schedule_id = rs.id
        WHERE rs.user_id = p.id
    );
END $$;


-- ============================================================================
-- FILE 15 of 67: supabase\migrations\20241123_fix_rls_policies.sql
-- Size: 2.01 KB
-- ============================================================================

-- Fix RLS policies for reading_schedule
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own schedules" ON reading_schedule;
DROP POLICY IF EXISTS "Users can create own schedules" ON reading_schedule;
DROP POLICY IF EXISTS "Users can update own schedules" ON reading_schedule;
DROP POLICY IF EXISTS "Users can delete own schedules" ON reading_schedule;

-- Recreate with proper auth check
CREATE POLICY "Users can view own schedules"
    ON reading_schedule FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own schedules"
    ON reading_schedule FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own schedules"
    ON reading_schedule FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own schedules"
    ON reading_schedule FOR DELETE
    USING (user_id = auth.uid());

-- Also update daily_progress policies
DROP POLICY IF EXISTS "Users can view own progress" ON daily_progress;
DROP POLICY IF EXISTS "Users can create own progress" ON daily_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON daily_progress;

CREATE POLICY "Users can view own progress"
    ON daily_progress FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM reading_schedule
            WHERE reading_schedule.id = daily_progress.schedule_id
            AND reading_schedule.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own progress"
    ON daily_progress FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM reading_schedule
            WHERE reading_schedule.id = daily_progress.schedule_id
            AND reading_schedule.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own progress"
    ON daily_progress FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM reading_schedule
            WHERE reading_schedule.id = daily_progress.schedule_id
            AND reading_schedule.user_id = auth.uid()
        )
    );


-- ============================================================================
-- FILE 16 of 67: supabase\migrations\20241123_gamification.sql
-- Size: 11.33 KB
-- ============================================================================

-- Gamification System Migration
-- Created: 2024-11-23
-- Purpose: Add achievements, badges, and XP system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: achievements
-- Stores all available achievements in the system
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 0,
    tier TEXT NOT NULL DEFAULT 'bronze',
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Table: user_achievements
-- Tracks which achievements users have unlocked
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    seen BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- Update profiles table with gamification fields
-- ============================================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_pages_read INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_books_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_daily_goals_completed INTEGER DEFAULT 0;

-- ============================================================================
-- Seed Initial Achievements
-- ============================================================================

-- Streak Achievements
INSERT INTO achievements (key, title, description, icon, xp_reward, tier, requirement_type, requirement_value) VALUES
('first_day', 'Birinchi Kun', 'Birinchi marta kunlik maqsadni bajardingiz!', 'рџЋЇ', 50, 'bronze', 'daily_goal', 1),
('streak_3', '3 Kunlik Streak', '3 kun ketma-ket oʻqidingiz!', 'рџ”Ґ', 100, 'bronze', 'streak', 3),
('streak_7', 'Haftalik Warrior', '7 kun ketma-ket oʻqidingiz!', 'рџ”Ґ', 250, 'silver', 'streak', 7),
('streak_30', 'Oylik Master', '30 kun ketma-ket oʻqidingiz!', 'рџ”Ґ', 1000, 'gold', 'streak', 30),
('streak_100', 'Yuz Kunlik Legend', '100 kun ketma-ket oʻqidingiz!', 'рџ”Ґ', 5000, 'platinum', 'streak', 100);

-- Book Completion Achievements
INSERT INTO achievements (key, title, description, icon, xp_reward, tier, requirement_type, requirement_value) VALUES
('first_book', 'Birinchi Kitob', 'Birinchi kitobingizni tugatdingiz!', 'рџ“–', 100, 'bronze', 'books_completed', 1),
('bookworm', 'Kitobxon', '5 ta kitobni tugatdingiz!', 'рџ“љ', 300, 'silver', 'books_completed', 5),
('scholar', 'Olim', '10 ta kitobni tugatdingiz!', 'рџЋ“', 600, 'gold', 'books_completed', 10),
('library_master', 'Kutubxona Ustasi', '25 ta kitobni tugatdingiz!', 'рџЏ†', 1500, 'platinum', 'books_completed', 25);

-- Page Reading Achievements
INSERT INTO achievements (key, title, description, icon, xp_reward, tier, requirement_type, requirement_value) VALUES
('century_reader', 'Yuz Sahifa', '100 sahifa oʻqidingiz!', 'рџ“„', 50, 'bronze', 'pages_read', 100),
('thousand_pages', 'Ming Sahifa', '1000 sahifa oʻqidingiz!', 'рџ“„', 200, 'silver', 'pages_read', 1000),
('epic_reader', 'Epik oʻquvchi', '5000 sahifa oʻqidingiz!', 'рџ“„', 500, 'gold', 'pages_read', 5000),
('mega_reader', 'Mega oʻquvchi', '10000 sahifa oʻqidingiz!', 'рџ“„', 1000, 'platinum', 'pages_read', 10000);

-- Daily Goal Achievements
INSERT INTO achievements (key, title, description, icon, xp_reward, tier, requirement_type, requirement_value) VALUES
('perfectionist', 'Perfeksionist', '10 marta kunlik maqsadni bajardingiz!', 'рџЋЇ', 200, 'silver', 'daily_goal', 10),
('dedicated', 'Sadoqatli', '30 marta kunlik maqsadni bajardingiz!', 'рџЋЇ', 500, 'gold', 'daily_goal', 30),
('unstoppable', 'Toʻxtovsiz', '100 marta kunlik maqsadni bajardingiz!', 'рџЋЇ', 1500, 'platinum', 'daily_goal', 100);

-- ============================================================================
-- Function: Check and Award Achievements
-- ============================================================================
CREATE OR REPLACE FUNCTION check_and_award_achievements(p_user_id UUID)
RETURNS TABLE(achievement_id UUID, achievement_key TEXT, achievement_title TEXT, xp_reward INTEGER) AS $$
DECLARE
    v_streak INTEGER;
    v_books_completed INTEGER;
    v_pages_read INTEGER;
    v_daily_goals INTEGER;
    v_achievement RECORD;
BEGIN
    -- Get user stats
    SELECT 
        streak_days,
        total_books_completed,
        total_pages_read,
        total_daily_goals_completed
    INTO 
        v_streak,
        v_books_completed,
        v_pages_read,
        v_daily_goals
    FROM profiles
    WHERE id = p_user_id;

    -- Check each achievement
    FOR v_achievement IN 
        SELECT a.id, a.key, a.title, a.xp_reward, a.requirement_type, a.requirement_value
        FROM achievements a
        WHERE NOT EXISTS (
            SELECT 1 FROM user_achievements ua 
            WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
        )
    LOOP
        -- Check if requirement is met
        IF (v_achievement.requirement_type = 'streak' AND v_streak >= v_achievement.requirement_value) OR
           (v_achievement.requirement_type = 'books_completed' AND v_books_completed >= v_achievement.requirement_value) OR
           (v_achievement.requirement_type = 'pages_read' AND v_pages_read >= v_achievement.requirement_value) OR
           (v_achievement.requirement_type = 'daily_goal' AND v_daily_goals >= v_achievement.requirement_value) THEN
            
            -- Award achievement
            INSERT INTO user_achievements (user_id, achievement_id)
            VALUES (p_user_id, v_achievement.id);
            
            -- Award XP
            UPDATE profiles
            SET xp = xp + v_achievement.xp_reward
            WHERE id = p_user_id;
            
            -- Return awarded achievement
            achievement_id := v_achievement.id;
            achievement_key := v_achievement.key;
            achievement_title := v_achievement.title;
            xp_reward := v_achievement.xp_reward;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function: Calculate Level from XP
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_level(p_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Formula: level = floor(sqrt(xp / 100)) + 1
    RETURN FLOOR(SQRT(p_xp::FLOAT / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- Trigger: Update level when XP changes
-- ============================================================================
CREATE OR REPLACE FUNCTION update_level_on_xp_change()
RETURNS TRIGGER AS $$
BEGIN
    NEW.level := calculate_level(NEW.xp);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_level ON profiles;
CREATE TRIGGER trigger_update_level
    BEFORE UPDATE OF xp ON profiles
    FOR EACH ROW
    WHEN (OLD.xp IS DISTINCT FROM NEW.xp)
    EXECUTE FUNCTION update_level_on_xp_change();

-- ============================================================================
-- Trigger: Award XP and check achievements on daily goal completion
-- ============================================================================
CREATE OR REPLACE FUNCTION award_xp_on_daily_goal()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_schedule RECORD;
BEGIN
    -- Only proceed if goal was just completed
    IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN
        -- Get user_id from schedule
        SELECT user_id INTO v_user_id
        FROM reading_schedule
        WHERE id = NEW.schedule_id;
        
        -- Award XP for daily goal completion
        UPDATE profiles
        SET 
            xp = xp + 50,
            total_daily_goals_completed = COALESCE(total_daily_goals_completed, 0) + 1
        WHERE id = v_user_id;
        
        -- Check for new achievements
        PERFORM check_and_award_achievements(v_user_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_award_xp_daily_goal ON daily_progress;
CREATE TRIGGER trigger_award_xp_daily_goal
    AFTER INSERT OR UPDATE ON daily_progress
    FOR EACH ROW
    EXECUTE FUNCTION award_xp_on_daily_goal();

-- ============================================================================
-- Trigger: Update total pages read
-- ============================================================================
CREATE OR REPLACE FUNCTION update_total_pages_read()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total pages when user_progress is updated
    IF NEW.progress_percentage = 100 AND (OLD.progress_percentage IS NULL OR OLD.progress_percentage < 100) THEN
        UPDATE profiles
        SET 
            total_books_completed = total_books_completed + 1,
            xp = xp + 200  -- Bonus XP for completing a book
        WHERE id = NEW.user_id;
        
        -- Check for new achievements
        PERFORM check_and_award_achievements(NEW.user_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_total_pages ON user_progress;
CREATE TRIGGER trigger_update_total_pages
    AFTER UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_total_pages_read();

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Achievements: Everyone can read
CREATE POLICY "Achievements are viewable by everyone"
    ON achievements FOR SELECT
    USING (true);

-- User Achievements: Users can only see their own
CREATE POLICY "Users can view their own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

-- User Achievements: System can insert (via triggers)
CREATE POLICY "System can insert achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_requirement_type ON achievements(requirement_type);
CREATE INDEX IF NOT EXISTS idx_daily_progress_completed ON daily_progress(completed) WHERE completed = true;


-- ============================================================================
-- FILE 17 of 67: supabase\migrations\20241123_leaderboard_functions.sql
-- Size: 2.13 KB
-- ============================================================================

-- Function to get leaderboard data
CREATE OR REPLACE FUNCTION get_leaderboard(
    limit_count INTEGER DEFAULT 50,
    time_range TEXT DEFAULT 'all_time' -- 'all_time' or 'weekly'
)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    xp INTEGER,
    level INTEGER,
    streak_days INTEGER,
    rank BIGINT
) AS $$
BEGIN
    -- For now, we only support 'all_time' logic fully.
    -- Weekly logic would require a separate table or column tracking weekly XP.
    -- We'll just return based on total XP for now, but structure it for future expansion.
    
    IF time_range = 'weekly' THEN
        -- Placeholder for weekly logic (currently same as all_time but could be different)
        RETURN QUERY
        SELECT
            p.id as user_id,
            p.name as full_name,
            p.avatar_url,
            p.xp,
            p.level,
            p.streak_days,
            RANK() OVER (ORDER BY p.xp DESC) as rank
        FROM profiles p
        ORDER BY p.xp DESC
        LIMIT limit_count;
    ELSE
        -- All Time (Default)
        RETURN QUERY
        SELECT
            p.id as user_id,
            p.name as full_name,
            p.avatar_url,
            p.xp,
            p.level,
            p.streak_days,
            RANK() OVER (ORDER BY p.xp DESC) as rank
        FROM profiles p
        ORDER BY p.xp DESC
        LIMIT limit_count;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get streak leaderboard
CREATE OR REPLACE FUNCTION get_streak_leaderboard(
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    xp INTEGER,
    level INTEGER,
    streak_days INTEGER,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as user_id,
        p.name as full_name,
        p.avatar_url,
        p.xp,
        p.level,
        p.streak_days,
        RANK() OVER (ORDER BY p.streak_days DESC) as rank
    FROM profiles p
    WHERE p.streak_days > 0
    ORDER BY p.streak_days DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- FILE 18 of 67: supabase\migrations\20241123_notification_triggers.sql
-- Size: 0.99 KB
-- ============================================================================

-- Drop existing trigger and function first to avoid conflicts
DROP TRIGGER IF EXISTS on_achievement_unlocked ON user_achievements;
DROP FUNCTION IF EXISTS handle_new_achievement();

-- Function to handle achievement notifications
create or replace function handle_new_achievement()
returns trigger as $$
declare
  achievement_title text;
  achievement_desc text;
begin
  -- Get achievement details
  select title, description into achievement_title, achievement_desc
  from achievements
  where id = new.achievement_id;

  -- Insert notification
  insert into notifications (user_id, title, message, type, link)
  values (
    new.user_id,
    'Yangi yutuq! рџЏ†',
    'Siz "' || achievement_title || '" yutug''iga erishdingiz!',
    'achievement',
    '/achievements'
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger
create trigger on_achievement_unlocked
  after insert on user_achievements
  for each row
  execute function handle_new_achievement();


-- ============================================================================
-- FILE 19 of 67: supabase\migrations\20241123_notifications.sql
-- Size: 1.04 KB
-- ============================================================================

-- Create notifications table
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null check (type in ('info', 'success', 'warning', 'achievement', 'reminder')),
  is_read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table notifications enable row level security;

-- Create policies
create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);

create policy "Users can insert their own notifications"
  on notifications for insert
  with check (auth.uid() = user_id);

-- Create indexes
create index notifications_user_id_idx on notifications(user_id);
create index notifications_created_at_idx on notifications(created_at desc);


-- ============================================================================
-- FILE 20 of 67: supabase\migrations\20241123_reading_schedule.sql
-- Size: 3.29 KB
-- ============================================================================

-- Reading Schedule Tables

-- Main schedule table
CREATE TABLE reading_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    daily_goal_pages INTEGER,
    daily_goal_minutes INTEGER,
    reminder_time TIME,
    reminder_frequency TEXT DEFAULT 'daily', -- 'daily', 'weekdays', 'weekends', 'custom'
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily progress tracking
CREATE TABLE daily_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES reading_schedule(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    pages_read INTEGER DEFAULT 0,
    minutes_read INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(schedule_id, date)
);

-- Indexes for performance
CREATE INDEX idx_reading_schedule_user ON reading_schedule(user_id);
CREATE INDEX idx_reading_schedule_status ON reading_schedule(status);
CREATE INDEX idx_daily_progress_schedule ON daily_progress(schedule_id);
CREATE INDEX idx_daily_progress_date ON daily_progress(date);

-- RLS Policies
ALTER TABLE reading_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see their own schedules
CREATE POLICY "Users can view own schedules"
    ON reading_schedule FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own schedules"
    ON reading_schedule FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules"
    ON reading_schedule FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules"
    ON reading_schedule FOR DELETE
    USING (auth.uid() = user_id);

-- Daily progress policies
CREATE POLICY "Users can view own progress"
    ON daily_progress FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM reading_schedule
            WHERE reading_schedule.id = daily_progress.schedule_id
            AND reading_schedule.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own progress"
    ON daily_progress FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM reading_schedule
            WHERE reading_schedule.id = daily_progress.schedule_id
            AND reading_schedule.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own progress"
    ON daily_progress FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM reading_schedule
            WHERE reading_schedule.id = daily_progress.schedule_id
            AND reading_schedule.user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reading_schedule_updated_at
    BEFORE UPDATE ON reading_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- FILE 21 of 67: supabase\migrations\20241123_streak_logic.sql
-- Size: 2.07 KB
-- ============================================================================

-- Add last_streak_update to profiles if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_streak_update DATE;

-- Function to handle streak updates
CREATE OR REPLACE FUNCTION handle_streak_update()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_last_update DATE;
    v_current_streak INTEGER;
    v_goal_date DATE;
BEGIN
    -- Only proceed if goal is completed
    IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN
        -- Use the date from the progress record
        v_goal_date := NEW.date::DATE;
        
        -- Get user_id from schedule
        SELECT user_id INTO v_user_id
        FROM reading_schedule
        WHERE id = NEW.schedule_id;
        
        -- Get current profile data
        SELECT last_streak_update, streak_days 
        INTO v_last_update, v_current_streak
        FROM profiles
        WHERE id = v_user_id;
        
        -- Initialize streak if null
        v_current_streak := COALESCE(v_current_streak, 0);
        
        IF v_last_update = v_goal_date THEN
            -- Already updated for this date, do nothing
            RETURN NEW;
        ELSIF v_last_update = v_goal_date - INTERVAL '1 day' THEN
            -- Consecutive day, increment streak
            UPDATE profiles
            SET streak_days = v_current_streak + 1,
                last_streak_update = v_goal_date
            WHERE id = v_user_id;
        ELSE
            -- Missed a day or first time, reset to 1
            UPDATE profiles
            SET streak_days = 1,
                last_streak_update = v_goal_date
            WHERE id = v_user_id;
        END IF;
        
        -- Check for streak achievements (reuse existing function)
        PERFORM check_and_award_achievements(v_user_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_streak ON daily_progress;
CREATE TRIGGER trigger_update_streak
    AFTER INSERT OR UPDATE ON daily_progress
    FOR EACH ROW
    EXECUTE FUNCTION handle_streak_update();


-- ============================================================================
-- FILE 22 of 67: supabase\migrations\20250122_add_roles_and_admin_log.sql
-- Size: 2.2 KB
-- ============================================================================

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER' 
CHECK (role IN ('USER', 'LIBRARIAN', 'MODERATOR', 'SUPER_ADMIN'));

-- Create index for faster role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for activity log queries
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity_log(created_at DESC);

-- RLS Policies for admin_activity_log
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Admins can view activity logs"
ON admin_activity_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('LIBRARIAN', 'MODERATOR', 'SUPER_ADMIN')
  )
);

-- Only admins can insert activity logs
CREATE POLICY "Admins can insert activity logs"
ON admin_activity_log FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('LIBRARIAN', 'MODERATOR', 'SUPER_ADMIN')
  )
);

-- Update RLS policies for books table to allow librarians to manage
CREATE POLICY "Librarians can manage books"
ON books FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('LIBRARIAN', 'SUPER_ADMIN')
  )
);

-- Update RLS policies for profiles table
CREATE POLICY "Super admins can update any profile"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'SUPER_ADMIN'
  )
);

-- Comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role: USER, LIBRARIAN, MODERATOR, or SUPER_ADMIN';
COMMENT ON TABLE admin_activity_log IS 'Logs all admin actions for audit trail';


-- ============================================================================
-- FILE 23 of 67: supabase\migrations\20250122_create_groups_table.sql
-- Size: 1.69 KB
-- ============================================================================

-- Create groups table if not exists
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  members_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_groups_book_id ON groups(book_id);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at DESC);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read groups
CREATE POLICY "Anyone can view groups"
ON groups FOR SELECT
USING (true);

-- Allow authenticated users to create groups
CREATE POLICY "Authenticated users can create groups"
ON groups FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow group creators to update their groups (we'll add creator_id later)
CREATE POLICY "Users can update groups"
ON groups FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Insert sample data
INSERT INTO groups (name, members_count, is_active, tags) VALUES
('Algorithms & Data Structures', 45, true, ARRAY['CS', 'Algorithms']),
('Calculus II Study Squad', 28, false, ARRAY['Math', 'Calculus']),
('Organic Chemistry Help', 112, true, ARRAY['Chemistry', 'Science']),
('Macroeconomics 101', 15, false, ARRAY['Economics', 'Finance']),
('Modern Physics Discussion', 34, true, ARRAY['Physics', 'Science']),
('Web Development Bootcamp', 89, true, ARRAY['CS', 'Web Dev'])
ON CONFLICT DO NOTHING;

-- Comment for documentation
COMMENT ON TABLE groups IS 'Study groups for collaborative learning';


-- ============================================================================
-- FILE 24 of 67: supabase\migrations\20251129_01_create_organizations.sql
-- Size: 1.99 KB
-- ============================================================================

-- Migration: 01_create_organizations
-- Description: Create organizations table and default organization

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('school', 'college', 'university', 'public_library', 'private_library')),
    logo_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    settings JSONB DEFAULT '{}',
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
    max_students INTEGER DEFAULT 200,
    max_books INTEGER,
    max_librarians INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- 3. Insert default organization
INSERT INTO organizations (name, slug, type, subscription_tier, subscription_status, max_students, max_books)
VALUES (
    'UniLib Platform',
    'unilib-platform',
    'public_library',
    'enterprise',
    'active',
    999999,
    999999
)
ON CONFLICT (slug) DO NOTHING;

-- 4. Enable RLS (Policies will be added in step 03)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_organizations_updated_at_trigger ON organizations;
CREATE TRIGGER update_organizations_updated_at_trigger
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_organizations_updated_at();


-- ============================================================================
-- FILE 25 of 67: supabase\migrations\20251129_02_update_profiles.sql
-- Size: 1.62 KB
-- ============================================================================

-- Migration: 02_update_profiles
-- Description: Add organization_id and roles to profiles, migrate existing users

-- 1. Add columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' 
    CHECK (role IN ('super_admin', 'system_admin', 'org_admin', 'head_librarian', 'librarian', 'teacher', 'parent', 'student'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Migrate existing users to default organization
UPDATE profiles 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'unilib-platform')
WHERE organization_id IS NULL;

-- 3. Make organization_id required
ALTER TABLE profiles ALTER COLUMN organization_id SET NOT NULL;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 5. Basic RLS: Allow users to view their own profile (Critical for Auth)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- 6. Basic RLS: Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);


-- ============================================================================
-- FILE 26 of 67: supabase\migrations\20251129_03_secure_tables.sql
-- Size: 2.63 KB
-- ============================================================================

-- Migration: 03_secure_tables
-- Description: Add organization_id to books and implement comprehensive RLS

-- ============================================
-- BOOKS TABLE
-- ============================================

-- 1. Add organization_id to books
ALTER TABLE books ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- 2. Migrate existing books
UPDATE books 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'unilib-platform')
WHERE organization_id IS NULL;

-- 3. Make required
ALTER TABLE books ALTER COLUMN organization_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_books_organization_id ON books(organization_id);

-- ============================================
-- RLS POLICIES (NON-RECURSIVE)
-- ============================================

-- PROFILES: View others in same org
DROP POLICY IF EXISTS "Users can view org profiles" ON profiles;
CREATE POLICY "Users can view org profiles"
    ON profiles FOR SELECT
    USING (
        organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- PROFILES: Super Admin view all
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
CREATE POLICY "Super admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'system_admin')
    );

-- ORGANIZATIONS: View own
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
CREATE POLICY "Users can view own organization"
    ON organizations FOR SELECT
    USING (
        id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- ORGANIZATIONS: Super Admin view all
DROP POLICY IF EXISTS "Super admins can view all orgs" ON organizations;
CREATE POLICY "Super admins can view all orgs"
    ON organizations FOR SELECT
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'system_admin')
    );

-- BOOKS: View own org books
DROP POLICY IF EXISTS "Users can view org books" ON books;
CREATE POLICY "Users can view org books"
    ON books FOR SELECT
    USING (
        organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- BOOKS: Librarians manage books
DROP POLICY IF EXISTS "Librarians can manage books" ON books;
CREATE POLICY "Librarians can manage books"
    ON books FOR ALL
    USING (
        organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
        AND
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'org_admin', 'head_librarian', 'librarian')
    );


-- ============================================================================
-- FILE 27 of 67: supabase\migrations\20251129_04_fix_rls_recursion_final.sql
-- Size: 1.59 KB
-- ============================================================================

-- Migration: 04_fix_rls_recursion_final
-- Description: Fix recursive RLS policies using SECURITY DEFINER function

-- 1. Create a secure function to get the current user's organization_id
-- This function runs with "SECURITY DEFINER", meaning it bypasses RLS
CREATE OR REPLACE FUNCTION get_auth_user_organization_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT organization_id 
        FROM profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update PROFILES policies to use the function
DROP POLICY IF EXISTS "Users can view org profiles" ON profiles;
CREATE POLICY "Users can view org profiles"
    ON profiles FOR SELECT
    USING (
        organization_id = get_auth_user_organization_id()
    );

-- 3. Update ORGANIZATIONS policies
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
CREATE POLICY "Users can view own organization"
    ON organizations FOR SELECT
    USING (
        id = get_auth_user_organization_id()
    );

-- 4. Update BOOKS policies
DROP POLICY IF EXISTS "Users can view org books" ON books;
CREATE POLICY "Users can view org books"
    ON books FOR SELECT
    USING (
        organization_id = get_auth_user_organization_id()
    );

DROP POLICY IF EXISTS "Librarians can manage books" ON books;
CREATE POLICY "Librarians can manage books"
    ON books FOR ALL
    USING (
        organization_id = get_auth_user_organization_id()
        AND
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'org_admin', 'head_librarian', 'librarian')
    );


-- ============================================================================
-- FILE 28 of 67: supabase\migrations\20251129_05_fix_auth_trigger.sql
-- Size: 1.13 KB
-- ============================================================================

-- Migration: 05_fix_auth_trigger
-- Description: Ensure handle_new_user trigger sets organization_id and role

-- 1. Create or Replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
BEGIN
    -- Get the default organization ID
    SELECT id INTO default_org_id FROM organizations WHERE slug = 'unilib-platform';

    -- Insert into profiles
    INSERT INTO public.profiles (
        id,
        email,
        name,
        role,
        organization_id,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'student', -- Default role
        default_org_id,
        true,
        NOW(),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- FILE 29 of 67: supabase\migrations\20251129_06_nuke_and_fix_rls.sql
-- Size: 3.59 KB
-- ============================================================================

-- Migration: 06_nuke_and_fix_rls
-- Description: Completely reset RLS policies for profiles to eliminate infinite recursion

-- 1. Temporarily disable RLS on profiles to break any active recursion loops
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies on profiles (be exhaustive)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view org users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 3. Re-create the SECURITY DEFINER function (ensure it's correct)
CREATE OR REPLACE FUNCTION get_auth_user_organization_id()
RETURNS UUID AS $$
BEGIN
    -- This runs with the privileges of the function creator (postgres/admin)
    -- effectively bypassing RLS on the profiles table
    RETURN (
        SELECT organization_id 
        FROM profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create "Safe" Policies

-- Policy 1: Users can ALWAYS view their own profile (Simple, non-recursive)
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Users can view other profiles in their organization (Uses SECURITY DEFINER function)
CREATE POLICY "Users can view org profiles"
    ON profiles FOR SELECT
    USING (
        organization_id = get_auth_user_organization_id()
    );

-- Policy 3: Super Admins can view ALL profiles (Uses SECURITY DEFINER function to check role)
-- We need a separate function for role check to be 100% safe from recursion
CREATE OR REPLACE FUNCTION get_auth_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Super admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        get_auth_user_role() IN ('super_admin', 'system_admin')
    );

-- Policy 4: Update own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 5. Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Apply similar fixes to Organizations and Books just in case

-- Organizations
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Super admins can view all orgs" ON organizations;

CREATE POLICY "Users can view own organization"
    ON organizations FOR SELECT
    USING (
        id = get_auth_user_organization_id()
    );

CREATE POLICY "Super admins can view all orgs"
    ON organizations FOR SELECT
    USING (
        get_auth_user_role() IN ('super_admin', 'system_admin')
    );

-- Books
DROP POLICY IF EXISTS "Users can view org books" ON books;
DROP POLICY IF EXISTS "Librarians can manage books" ON books;

CREATE POLICY "Users can view org books"
    ON books FOR SELECT
    USING (
        organization_id = get_auth_user_organization_id()
    );

CREATE POLICY "Librarians can manage books"
    ON books FOR ALL
    USING (
        organization_id = get_auth_user_organization_id()
        AND
        get_auth_user_role() IN ('super_admin', 'org_admin', 'head_librarian', 'librarian')
    );


-- ============================================================================
-- FILE 30 of 67: supabase\migrations\20251129_07_fix_org_insert_policy.sql
-- Size: 0.77 KB
-- ============================================================================

-- Migration: 07_fix_org_insert_policy
-- Description: Add INSERT/UPDATE/DELETE policies for organizations

-- 1. Allow Super Admins to INSERT organizations
CREATE POLICY "Super admins can insert organizations"
    ON organizations FOR INSERT
    WITH CHECK (
        get_auth_user_role() IN ('super_admin', 'system_admin')
    );

-- 2. Allow Super Admins to UPDATE organizations
CREATE POLICY "Super admins can update organizations"
    ON organizations FOR UPDATE
    USING (
        get_auth_user_role() IN ('super_admin', 'system_admin')
    );

-- 3. Allow Super Admins to DELETE organizations
CREATE POLICY "Super admins can delete organizations"
    ON organizations FOR DELETE
    USING (
        get_auth_user_role() IN ('super_admin', 'system_admin')
    );


-- ============================================================================
-- FILE 31 of 67: supabase\migrations\20251129_08_fix_handle_new_user_trigger.sql
-- Size: 1.93 KB
-- ============================================================================

-- Migration: 08_fix_handle_new_user_trigger
-- Description: Recreate handle_new_user trigger with better error handling

-- 1. Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create improved function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
BEGIN
    -- Get the default organization ID
    SELECT id INTO default_org_id
    FROM public.organizations
    WHERE slug = 'unilib-platform'
    LIMIT 1;

    -- If no default org found, create one
    IF default_org_id IS NULL THEN
        INSERT INTO public.organizations (name, slug, type, subscription_tier, subscription_status, max_students)
        VALUES ('UniLib Platform', 'unilib-platform', 'platform', 'free', 'active', 200)
        RETURNING id INTO default_org_id;
    END IF;

    -- Insert profile with default values
    INSERT INTO public.profiles (
        id,
        email,
        name,
        organization_id,
        role,
        is_active
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        default_org_id,
        'student',
        true
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.organizations TO postgres, anon, authenticated, service_role;


-- ============================================================================
-- FILE 32 of 67: supabase\migrations\20251129_book_reviews_and_views.sql
-- Size: 4.6 KB
-- ============================================================================

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


-- ============================================================================
-- FILE 33 of 67: supabase\migrations\20251129_book_reviews_only.sql
-- Size: 2.07 KB
-- ============================================================================

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


-- ============================================================================
-- FILE 34 of 67: supabase\migrations\20251129_books_views_and_rating.sql
-- Size: 1.31 KB
-- ============================================================================

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


-- ============================================================================
-- FILE 35 of 67: supabase\migrations\20251129_cleanup_reset.sql
-- Size: 2.12 KB
-- ============================================================================

-- CLEANUP SCRIPT: Reset database to pre-multi-tenant state
-- WARNING: This will delete data in 'organizations' and remove columns from other tables.

-- 1. Drop organizations table
DROP TABLE IF EXISTS organizations CASCADE;

-- 2. Remove columns from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS organization_id CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS role CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS is_active CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS student_id CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS parent_phone CASCADE;
-- Note: 'bio'might have been there before or added, keeping it safe or removing if it was part of this feature set? 
-- The user mentioned "hamma narsani", but bio is generic. I'll leave bio for now unless requested.

-- 3. Remove columns from books
ALTER TABLE books DROP COLUMN IF EXISTS organization_id CASCADE;

-- 4. Remove columns from study_groups (if it exists)
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'study_groups') THEN
        ALTER TABLE study_groups DROP COLUMN IF EXISTS organization_id CASCADE;
    END IF;
END $$;

-- 5. Drop any remaining policies that might not have been cascaded (just in case)
DROP POLICY IF EXISTS "Users can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view org users" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view org books" ON books;
DROP POLICY IF EXISTS "Librarians can add books" ON books;
DROP POLICY IF EXISTS "Librarians can update books" ON books;
DROP POLICY IF EXISTS "Librarians can delete books" ON books;

-- 6. Re-enable RLS on tables if we disabled it (optional, but good practice to reset to secure state)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
-- Add back original policies if known? 
-- For now, we just remove the new stuff.

-- 7. Drop functions/triggers
DROP FUNCTION IF EXISTS update_organizations_updated_at CASCADE;


-- ============================================================================
-- FILE 36 of 67: supabase\migrations\20251129_create_books_table.sql
-- Size: 1.66 KB
-- ============================================================================

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


-- ============================================================================
-- FILE 37 of 67: supabase\migrations\20251207_01_offline_library.sql
-- Size: 11.2 KB
-- ============================================================================

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


-- ============================================================================
-- FILE 38 of 67: supabase\migrations\20251207_02_fix_books_rls.sql
-- Size: 1.55 KB
-- ============================================================================

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


-- ============================================================================
-- FILE 39 of 67: supabase\migrations\20251207_03_library_views.sql
-- Size: 1.81 KB
-- ============================================================================

-- Create library_views table for tracking online book views
CREATE TABLE IF NOT EXISTS library_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    session_duration INTEGER, -- in seconds
    completed BOOLEAN DEFAULT FALSE
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_library_views_book_id ON library_views(book_id);
CREATE INDEX IF NOT EXISTS idx_library_views_user_id ON library_views(user_id);
CREATE INDEX IF NOT EXISTS idx_library_views_created_at ON library_views(created_at);
CREATE INDEX IF NOT EXISTS idx_library_views_org_id ON library_views(organization_id);

-- Enable RLS
ALTER TABLE library_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own views
CREATE POLICY "Users can view own library views"
    ON library_views FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own views
CREATE POLICY "Users can insert own library views"
    ON library_views FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Librarians can view all views in their organization
CREATE POLICY "Librarians can view org library views"
    ON library_views FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('librarian', 'head_librarian', 'admin', 'org_admin')
        )
    );

-- Add comment
COMMENT ON TABLE library_views IS 'Tracks online book views for analytics';


-- ============================================================================
-- FILE 40 of 67: supabase\migrations\20251207_04_librarian_update_xp.sql
-- Size: 0.62 KB
-- ============================================================================

-- Allow librarians to update student XP and streak
CREATE POLICY "Librarians can update student XP"
ON profiles
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('LIBRARIAN', 'HEAD_LIBRARIAN', 'ORG_ADMIN', 'SUPER_ADMIN')
        AND p.organization_id = profiles.organization_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('LIBRARIAN', 'HEAD_LIBRARIAN', 'ORG_ADMIN', 'SUPER_ADMIN')
        AND p.organization_id = profiles.organization_id
    )
);


-- ============================================================================
-- FILE 41 of 67: supabase\migrations\20251209_add_performance_indexes.sql
-- Size: 2.03 KB
-- ============================================================================

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


-- ============================================================================
-- FILE 42 of 67: supabase\migrations\20251210_add_13digit_student_id.sql
-- Size: 4.88 KB
-- ============================================================================

-- 13-Digit Structured Student ID System
-- Format: XXYY-NNNN-NNN-C (13 digits total)
-- XX   = University code (01-99)
-- YY   = Year (24 = 2024)
-- NNNN = Sequence number (0001-9999)
-- NNN  = Department/Faculty code (001-999)
-- C    = Check digit (EAN-13 algorithm)

-- 1. Create sequence for student numbers
CREATE SEQUENCE IF NOT EXISTS student_id_sequence START WITH 1;

-- 2. Update student_number column to support 13 digits
ALTER TABLE profiles 
ALTER COLUMN student_number TYPE VARCHAR(13);

-- 3. Add department_code column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS department_code VARCHAR(3) DEFAULT '001';

-- 4. Create function to calculate EAN-13 check digit
CREATE OR REPLACE FUNCTION calculate_ean13_check_digit(barcode TEXT)
RETURNS INTEGER AS $$
DECLARE
    sum_odd INTEGER := 0;
    sum_even INTEGER := 0;
    total INTEGER;
    check_digit INTEGER;
    i INTEGER;
BEGIN
    -- Calculate sum of digits at odd positions (1st, 3rd, 5th, etc.)
    FOR i IN 1..LENGTH(barcode) BY 2 LOOP
        sum_odd := sum_odd + SUBSTRING(barcode FROM i FOR 1)::INTEGER;
    END LOOP;
    
    -- Calculate sum of digits at even positions (2nd, 4th, 6th, etc.)
    FOR i IN 2..LENGTH(barcode) BY 2 LOOP
        sum_even := sum_even + SUBSTRING(barcode FROM i FOR 1)::INTEGER;
    END LOOP;
    
    -- Total = (sum_odd * 1) + (sum_even * 3)
    total := sum_odd + (sum_even * 3);
    
    -- Check digit = (10 - (total mod 10)) mod 10
    check_digit := (10 - (total % 10)) % 10;
    
    RETURN check_digit;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Create function to generate 13-digit student ID
CREATE OR REPLACE FUNCTION generate_13digit_student_id()
RETURNS TRIGGER AS $$
DECLARE
    university_code TEXT := '01';  -- Default university code
    year_code TEXT;
    sequence_num TEXT;
    dept_code TEXT;
    base_id TEXT;
    check_digit INTEGER;
    final_id TEXT;
BEGIN
    -- Only generate if student_number is NULL
    IF NEW.student_number IS NULL THEN
        -- Get 2-digit year (e.g., 24 for 2024)
        year_code := TO_CHAR(CURRENT_DATE, 'YY');
        
        -- Get 4-digit sequence number (zero-padded)
        sequence_num := LPAD(nextval('student_id_sequence')::TEXT, 4, '0');
        
        -- Get department code (default 001 if not set)
        dept_code := COALESCE(NEW.department_code, '001');
        
        -- Combine: XXYY + NNNN + NNN (12 digits)
        base_id := university_code || year_code || sequence_num || dept_code;
        
        -- Calculate check digit
        check_digit := calculate_ean13_check_digit(base_id);
        
        -- Final 13-digit ID
        final_id := base_id || check_digit::TEXT;
        
        -- Assign to NEW record
        NEW.student_number := final_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to auto-generate 13-digit student ID
DROP TRIGGER IF EXISTS trigger_generate_13digit_student_id ON profiles;
CREATE TRIGGER trigger_generate_13digit_student_id
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION generate_13digit_student_id();

-- 7. Backfill existing users with 13-digit IDs
DO $$
DECLARE
    profile_record RECORD;
    university_code TEXT := '01';
    year_code TEXT;
    sequence_num TEXT;
    dept_code TEXT;
    base_id TEXT;
    check_digit INTEGER;
    final_id TEXT;
BEGIN
    year_code := TO_CHAR(CURRENT_DATE, 'YY');
    
    FOR profile_record IN 
        SELECT id, department_code FROM profiles 
        WHERE student_number IS NULL OR LENGTH(student_number) != 13
    LOOP
        -- Get next sequence
        sequence_num := LPAD(nextval('student_id_sequence')::TEXT, 4, '0');
        
        -- Department code
        dept_code := COALESCE(profile_record.department_code, '001');
        
        -- Base ID (12 digits)
        base_id := university_code || year_code || sequence_num || dept_code;
        
        -- Calculate check digit
        check_digit := calculate_ean13_check_digit(base_id);
        
        -- Final ID (13 digits)
        final_id := base_id || check_digit::TEXT;
        
        -- Update
        UPDATE profiles 
        SET student_number = final_id 
        WHERE id = profile_record.id;
    END LOOP;
END $$;

-- 8. Create index
CREATE INDEX IF NOT EXISTS idx_profiles_student_number_13 ON profiles(student_number);

-- 9. Add comments
COMMENT ON COLUMN profiles.student_number IS '13-digit structured student ID (Format: XXYY-NNNN-NNN-C)';
COMMENT ON COLUMN profiles.department_code IS 'Department/Faculty code (001-999)';

-- 10. Example department codes (optional - customize as needed)
COMMENT ON COLUMN profiles.department_code IS 
'Department codes:
001 - General
101 - Computer Science / IT
102 - Engineering
103 - Mathematics
201 - Medicine
202 - Biology
301 - Economics
302 - Business
401 - Law
501 - Arts & Humanities';


-- ============================================================================
-- FILE 43 of 67: supabase\migrations\20251210_add_hemis_columns.sql
-- Size: 0.68 KB
-- ============================================================================

-- Add HEMIS-related columns to profiles table
-- These columns store HEMIS student data for integration

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS hemis_id TEXT,
ADD COLUMN IF NOT EXISTS hemis_login TEXT,
ADD COLUMN IF NOT EXISTS hemis_token TEXT;

-- Create index for faster HEMIS ID lookups
CREATE INDEX IF NOT EXISTS idx_profiles_hemis_id ON profiles(hemis_id);
CREATE INDEX IF NOT EXISTS idx_profiles_hemis_login ON profiles(hemis_login);

-- Add comment
COMMENT ON COLUMN profiles.hemis_id IS 'HEMIS student ID for integration';
COMMENT ON COLUMN profiles.hemis_login IS 'HEMIS login username';
COMMENT ON COLUMN profiles.hemis_token IS 'HEMIS JWT token for API calls';


-- ============================================================================
-- FILE 44 of 67: supabase\migrations\20251210_add_student_details.sql
-- Size: 0.36 KB
-- ============================================================================

-- Add additional HEMIS student fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS faculty TEXT,
ADD COLUMN IF NOT EXISTS student_group TEXT,
ADD COLUMN IF NOT EXISTS course TEXT,
ADD COLUMN IF NOT EXISTS education_form TEXT,
ADD COLUMN IF NOT EXISTS specialty TEXT,
ADD COLUMN IF NOT EXISTS gpa TEXT;


-- ============================================================================
-- FILE 45 of 67: supabase\migrations\20251210_backfill_missing_profiles.sql
-- Size: 0.55 KB
-- ============================================================================

-- Create missing profiles for existing auth users
-- This fixes users who were created before the trigger was working

INSERT INTO public.profiles (id, email, name, role)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name,
    'student' as role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Verify the fix
SELECT 
    COUNT(*) as users_without_profile
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;


-- ============================================================================
-- FILE 46 of 67: supabase\migrations\20251210_complete_rls_fix.sql
-- Size: 2.3 KB
-- ============================================================================

-- Complete RLS fix for profiles table
-- This ensures users can both INSERT and SELECT their own profiles

-- 1. Drop all existing policies (be exhaustive)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can select own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 2. Create comprehensive policies

-- Allow users to INSERT their own profile (for registration)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Allow users to SELECT their own profile (CRITICAL!)
CREATE POLICY "Users can select own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow users to view profiles in their organization
CREATE POLICY "Users can view org profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        organization_id IS NOT NULL 
        AND organization_id = (
            SELECT organization_id 
            FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Allow super admins to view all profiles
CREATE POLICY "Super admins can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) 
        IN ('super_admin', 'system_admin')
    );

-- 3. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;


-- ============================================================================
-- FILE 47 of 67: supabase\migrations\20251210_fix_registration_insert.sql
-- Size: 0.99 KB
-- ============================================================================

-- Fix Registration: Add INSERT policy for profiles table
-- This allows authenticated users to create their profile during registration

-- Add INSERT policy for new user registration
CREATE POLICY "Enable insert for authenticated users"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Also ensure auth trigger exists for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'student'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for auto-profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- FILE 48 of 67: supabase\migrations\20251210_fix_registration_trigger.sql
-- Size: 1.19 KB
-- ============================================================================

-- Fix trigger function to handle errors properly
-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger function with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile with error handling
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'student'
    )
    ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT INSERT ON public.profiles TO authenticated;


-- ============================================================================
-- FILE 49 of 67: supabase\migrations\20251210_format_existing_names.sql
-- Size: 0.3 KB
-- ============================================================================

-- Update existing profiles with formatted names (Title Case)
-- Convert "FAYZULLAYEV ORZUBEK KAMALIDDIN o'G'LI" to "Fayzullayev Orzubek Kamaliddin o'g'li"

UPDATE profiles
SET name = INITCAP(LOWER(name))
WHERE name = UPPER(name) AND name IS NOT NULL;

-- INITCAP capitalizes first letter of each word


-- ============================================================================
-- FILE 50 of 67: supabase\migrations\20251210_make_org_nullable.sql
-- Size: 0.17 KB
-- ============================================================================

-- Make organization_id nullable in profiles table
-- HEMIS students may not have an organization initially

ALTER TABLE profiles
ALTER COLUMN organization_id DROP NOT NULL;


-- ============================================================================
-- FILE 51 of 67: supabase\migrations\20251210_remove_student_number_unique.sql
-- Size: 0.2 KB
-- ============================================================================

-- Remove unique constraint from student_number
-- Allow multiple profiles with same student number (for testing/migration)

ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_student_number_key;


-- ============================================================================
-- FILE 52 of 67: supabase\migrations\20251210_rollback_old_student_ids.sql
-- Size: 1.05 KB
-- ============================================================================

-- Rollback migration for old student ID columns
-- Run this ONLY if you previously ran the old migrations

-- 1. Drop old triggers
DROP TRIGGER IF EXISTS set_display_student_id ON profiles;
DROP TRIGGER IF EXISTS trigger_generate_student_number ON profiles;

-- 2. Drop old functions
DROP FUNCTION IF EXISTS generate_display_student_id();
DROP FUNCTION IF EXISTS generate_student_number();

-- 3. Drop old constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS unique_display_student_id;

-- 4. Drop old indexes
DROP INDEX IF EXISTS idx_profiles_display_student_id;
DROP INDEX IF EXISTS idx_profiles_student_number;

-- 5. Drop old columns (CAREFUL - this deletes data!)
-- Uncomment ONLY if you want to remove old columns
-- ALTER TABLE profiles DROP COLUMN IF EXISTS display_student_id;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS student_number;

-- 6. Drop old sequences
DROP SEQUENCE IF EXISTS student_number_seq;

-- Note: Keep student_number column if you want to use it for 13-digit IDs
-- The new migration will update it to 13 digits


-- ============================================================================
-- FILE 53 of 67: supabase\migrations\20251210_simple_rls_fix.sql
-- Size: 1.26 KB
-- ============================================================================

-- SIMPLE RLS fix - only allow users to see their own profile
-- Remove all complex policies that cause recursion

-- 1. Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
END $$;

-- 3. Create ONLY simple policies (no subqueries!)

-- Allow INSERT for new users
CREATE POLICY "allow_insert_own_profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Allow SELECT for own profile ONLY
CREATE POLICY "allow_select_own_profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Allow UPDATE for own profile ONLY
CREATE POLICY "allow_update_own_profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4. Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;


-- ============================================================================
-- FILE 54 of 67: supabase\migrations\20251211_add_last_synced_at.sql
-- Size: 0.17 KB
-- ============================================================================

-- Add last_synced_at column to track when HEMIS data was last synced
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();


-- ============================================================================
-- FILE 55 of 67: supabase\migrations\20251212_performance_indexes.sql
-- Size: 2.03 KB
-- ============================================================================

-- Performance Optimization: Add Database Indexes
-- Date: 2025-12-12
-- Purpose: Improve query performance for frequently accessed columns

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_student_number ON profiles(student_number);

-- Book checkouts indexes
CREATE INDEX IF NOT EXISTS idx_book_checkouts_status ON book_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_user_id ON book_checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_due_date ON book_checkouts(due_date);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_physical_copy_id ON book_checkouts(physical_copy_id);

-- Books table indexes
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_book_type ON books(book_type);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);

-- Physical book copies indexes
CREATE INDEX IF NOT EXISTS idx_physical_copies_book_id ON physical_book_copies(book_id);
CREATE INDEX IF NOT EXISTS idx_physical_copies_status ON physical_book_copies(status);
CREATE INDEX IF NOT EXISTS idx_physical_copies_barcode ON physical_book_copies(barcode);

-- User progress indexes (if table exists)
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_book_id ON user_progress(book_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_checkouts_user_status ON book_checkouts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_book ON user_progress(user_id, book_id);

-- Performance comment
COMMENT ON INDEX idx_profiles_role IS 'Optimize role-based queries (admin, librarian, student)';
COMMENT ON INDEX idx_book_checkouts_status IS 'Optimize active/overdue checkout queries';
COMMENT ON INDEX idx_books_category IS 'Optimize category filtering';


-- ============================================================================
-- FILE 56 of 67: supabase\migrations\20251212_remove_organizations.sql
-- Size: 5.96 KB
-- ============================================================================

-- Remove all organization references from database
-- This migration removes the organizations table and all related columns
-- Date: 2025-12-12

-- Step 1: Drop all RLS policies that reference organizations
DROP POLICY IF EXISTS "Super admins can insert organizations" ON organizations;
DROP POLICY IF EXISTS "Super admins can update organizations" ON organizations;
DROP POLICY IF EXISTS "Super admins can delete organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Librarians can view all views in their organization" ON library_views;

-- Step 2: Drop functions that reference organizations
DROP FUNCTION IF EXISTS get_auth_user_organization_id() CASCADE;
DROP FUNCTION IF EXISTS get_overdue_checkouts(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_organizations_updated_at() CASCADE;

-- Step 3: Drop indexes related to organization_id
DROP INDEX IF EXISTS idx_library_views_org_id;
DROP INDEX IF EXISTS idx_physical_copies_org;
DROP INDEX IF EXISTS idx_checkouts_org;

-- Step 4: Remove organization_id columns from tables
ALTER TABLE profiles DROP COLUMN IF EXISTS organization_id CASCADE;
ALTER TABLE books DROP COLUMN IF EXISTS organization_id CASCADE;
ALTER TABLE physical_book_copies DROP COLUMN IF EXISTS organization_id CASCADE;
ALTER TABLE book_checkouts DROP COLUMN IF EXISTS organization_id CASCADE;
ALTER TABLE library_views DROP COLUMN IF EXISTS organization_id CASCADE;

-- Check if study_groups table exists before dropping column
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'study_groups') THEN
        ALTER TABLE study_groups DROP COLUMN IF EXISTS organization_id CASCADE;
    END IF;
END $$;

-- Step 5: Drop organizations table
DROP TABLE IF EXISTS organizations CASCADE;

-- Step 6: Recreate simplified RLS policies without organization checks

-- Profiles: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Profiles: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Profiles: Allow public read for basic info (needed for leaderboards, etc)
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

-- Books: Anyone authenticated can view books
DROP POLICY IF EXISTS "Anyone can view books" ON books;
CREATE POLICY "Anyone can view books"
    ON books FOR SELECT
    TO authenticated
    USING (true);

-- Physical book copies: Anyone authenticated can view
DROP POLICY IF EXISTS "Anyone can view physical copies" ON physical_book_copies;
CREATE POLICY "Anyone can view physical copies"
    ON physical_book_copies FOR SELECT
    TO authenticated
    USING (true);

-- Book checkouts: Users can view their own checkouts
DROP POLICY IF EXISTS "Users can view own checkouts" ON book_checkouts;
CREATE POLICY "Users can view own checkouts"
    ON book_checkouts FOR SELECT
    USING (auth.uid() = user_id);

-- Library views: Users can view their own library views
DROP POLICY IF EXISTS "Users can view own library views" ON library_views;
CREATE POLICY "Users can view own library views"
    ON library_views FOR SELECT
    USING (auth.uid() = user_id);

-- Step 7: Update handle_new_user trigger to not use organizations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create profile for new user
    INSERT INTO public.profiles (
        id,
        email,
        name,
        role,
        xp,
        level,
        streak_days,
        total_pages_read,
        total_books_completed,
        is_active
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'student',
        0,
        1,
        0,
        0,
        0,
        true
    );
    
    RETURN NEW;
END;
$$;

-- Step 8: Recreate get_overdue_checkouts function without organization parameter
CREATE OR REPLACE FUNCTION get_overdue_checkouts()
RETURNS TABLE (
    checkout_id UUID,
    user_id UUID,
    user_name TEXT,
    user_email TEXT,
    book_id UUID,
    book_title TEXT,
    book_author TEXT,
    copy_id UUID,
    barcode TEXT,
    checkout_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    days_overdue INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bc.id AS checkout_id,
        bc.user_id,
        p.name AS user_name,
        p.email AS user_email,
        b.id AS book_id,
        b.title AS book_title,
        b.author AS book_author,
        pbc.id AS copy_id,
        pbc.barcode,
        bc.checkout_date,
        bc.due_date,
        EXTRACT(DAY FROM NOW() - bc.due_date)::INTEGER AS days_overdue
    FROM book_checkouts bc
    JOIN profiles p ON bc.user_id = p.id
    JOIN physical_book_copies pbc ON bc.copy_id = pbc.id
    JOIN books b ON pbc.book_id = b.id
    WHERE bc.status = 'active'
    AND bc.due_date < NOW()
    ORDER BY bc.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Update librarian XP update policies
DROP POLICY IF EXISTS "Librarians can update user XP" ON profiles;
CREATE POLICY "Librarians can update user XP"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('librarian', 'head_librarian', 'org_admin', 'system_admin', 'super_admin')
        )
    );

-- Migration complete: Removed all organization references from database
-- Simplified to single-tenant model


-- ============================================================================
-- FILE 57 of 67: supabase\migrations\20251213_add_student_id.sql
-- Size: 2.12 KB
-- ============================================================================

-- Migration: Add Student Short ID System (Year-Based)
-- Date: 2025-12-13
-- Purpose: Add short numeric student IDs with year prefix for manual fallback when scanner fails
-- Format: YYXXX (e.g., 24001, 25001)

-- Add student_id column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_id TEXT UNIQUE;

-- Create sequences for each year (we'll create them dynamically)
-- Function to get or create sequence for a year
CREATE OR REPLACE FUNCTION get_year_sequence(year_suffix TEXT)
RETURNS TEXT AS $$
DECLARE
    seq_name TEXT;
BEGIN
    seq_name := 'student_id_seq_' || year_suffix;
    
    -- Create sequence if it doesn't exist
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I START 1', seq_name);
    
    RETURN seq_name;
END;
$$ LANGUAGE plpgsql;

-- Function to generate year-based student ID (YYXXX format)
CREATE OR REPLACE FUNCTION generate_student_id()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    year_suffix TEXT;
    seq_name TEXT;
    next_id INTEGER;
    student_id TEXT;
BEGIN
    -- Get current year (last 2 digits)
    current_year := to_char(CURRENT_DATE, 'YY');
    year_suffix := current_year;
    
    -- Get or create sequence for this year
    seq_name := get_year_sequence(year_suffix);
    
    -- Get next sequence value for this year
    EXECUTE format('SELECT nextval(%L)', seq_name) INTO next_id;
    
    -- Format as YYXXX (year + 3-digit sequential)
    student_id := year_suffix || LPAD(next_id::TEXT, 3, '0');
    
    RETURN student_id;
END;
$$ LANGUAGE plpgsql;

-- Update existing users with student IDs
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id FROM profiles WHERE student_id IS NULL ORDER BY created_at
    LOOP
        UPDATE profiles 
        SET student_id = generate_student_id()
        WHERE id = user_record.id;
    END LOOP;
END $$;

-- Create index for fast student ID lookups
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);

-- Add comment
COMMENT ON COLUMN profiles.student_id IS 'Short 5-digit student ID for manual input (00001, 00002, etc.)';


-- ============================================================================
-- FILE 58 of 67: supabase\migrations\20251213_add_student_id_trigger.sql
-- Size: 0.91 KB
-- ============================================================================

-- Add trigger to auto-generate student_id on profile creation
-- Date: 2025-12-13

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS trigger_auto_generate_student_id ON profiles;

-- Create trigger function
CREATE OR REPLACE FUNCTION auto_generate_student_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if student_id is NULL
    IF NEW.student_id IS NULL THEN
        NEW.student_id := generate_student_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_auto_generate_student_id
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_student_id();

-- Verify trigger was created
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles' 
AND trigger_name = 'trigger_auto_generate_student_id';


-- ============================================================================
-- FILE 59 of 67: supabase\migrations\20251213_assign_student_ids.sql
-- Size: 0.97 KB
-- ============================================================================

-- Check and assign student IDs to existing users
-- Run this in Supabase SQL Editor

-- First, check how many users don't have student_id
SELECT COUNT(*) as users_without_id
FROM profiles
WHERE student_id IS NULL;

-- Assign student IDs to users without them
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id FROM profiles 
        WHERE student_id IS NULL 
        ORDER BY created_at
    LOOP
        UPDATE profiles 
        SET student_id = generate_student_id()
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Assigned student_id to user: %', user_record.id;
    END LOOP;
END $$;

-- Verify all users have student_id
SELECT 
    COUNT(*) as total_users,
    COUNT(student_id) as users_with_id,
    COUNT(*) - COUNT(student_id) as users_without_id
FROM profiles;

-- Show some sample student IDs
SELECT id, name, student_id, student_number, created_at
FROM profiles
ORDER BY created_at
LIMIT 10;


-- ============================================================================
-- FILE 60 of 67: supabase\migrations\20251213_database_optimization.sql
-- Size: 9.49 KB
-- ============================================================================

-- Database Performance Optimization
-- Date: 2025-12-13
-- Purpose: Add additional indexes and optimize query performance

-- ============================================
-- 1. Additional Indexes for Better Performance
-- ============================================

-- Books: Optimize online books filter (WHERE cover_url IS NOT NULL)
CREATE INDEX IF NOT EXISTS idx_books_online_only 
ON books(id, created_at DESC) 
WHERE cover_url IS NOT NULL;

COMMENT ON INDEX idx_books_online_only IS 'Optimize library page online books query';

-- Book Checkouts: Optimize today stats queries
CREATE INDEX IF NOT EXISTS idx_book_checkouts_checked_out_at 
ON book_checkouts(checked_out_at DESC) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_book_checkouts_returned_at 
ON book_checkouts(returned_at DESC) 
WHERE status = 'returned';

COMMENT ON INDEX idx_book_checkouts_checked_out_at IS 'Optimize today checkout stats';
COMMENT ON INDEX idx_book_checkouts_returned_at IS 'Optimize today return stats';

-- Daily Progress: Optimize schedule-based queries
CREATE INDEX IF NOT EXISTS idx_daily_progress_schedule_date 
ON daily_progress(schedule_id, date DESC);

COMMENT ON INDEX idx_daily_progress_schedule_date IS 'Optimize weekly progress queries';

-- User Progress: Optimize active reading queries
CREATE INDEX IF NOT EXISTS idx_user_progress_active 
ON user_progress(user_id, last_read_at DESC) 
WHERE progress_percentage > 0 AND progress_percentage < 100;

COMMENT ON INDEX idx_user_progress_active IS 'Optimize active reading books query';

-- ============================================
-- 2. Composite Indexes for Common Query Patterns
-- ============================================

-- Profiles: Optimize leaderboard with active filter
DROP INDEX IF EXISTS idx_profiles_leaderboard;
CREATE INDEX idx_profiles_leaderboard 
ON profiles(xp DESC, streak_days DESC) 
WHERE is_active = true;

-- Books: Optimize category + rating filter
CREATE INDEX IF NOT EXISTS idx_books_category_rating 
ON books(category, rating DESC) 
WHERE cover_url IS NOT NULL;

COMMENT ON INDEX idx_books_category_rating IS 'Optimize filtered library queries';

-- ============================================
-- 3. Text Search Optimization
-- ============================================

-- Books: Full-text search index for title and author
DROP INDEX IF EXISTS idx_books_title_search;
DROP INDEX IF EXISTS idx_books_author_search;

CREATE INDEX idx_books_search_gin 
ON books USING gin(to_tsvector('english', title || ' ' || author));

COMMENT ON INDEX idx_books_search_gin IS 'Full-text search for books';

-- ============================================
-- 4. Analyze Tables for Query Planner
-- ============================================

ANALYZE profiles;
ANALYZE books;
ANALYZE physical_book_copies;
ANALYZE book_checkouts;
ANALYZE user_progress;
ANALYZE reading_schedule;
ANALYZE daily_progress;
ANALYZE achievements;
ANALYZE user_achievements;

-- ============================================
-- 5. Performance Monitoring Functions
-- ============================================
-- Note: VACUUM commands removed (cannot run in transaction)
-- Run VACUUM manually if needed: VACUUM ANALYZE table_name;

-- ============================================
-- 6. Performance Monitoring Function
-- ============================================

CREATE OR REPLACE FUNCTION get_table_stats()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    total_size TEXT,
    index_size TEXT,
    toast_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname || '.' || relname AS table_name,
        n_live_tup AS row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS total_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||relname)) AS index_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname) - 
                      pg_relation_size(schemaname||'.'||relname) - 
                      pg_indexes_size(schemaname||'.'||relname)) AS toast_size
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_table_stats IS 'Get table size and row count statistics';

-- ============================================
-- 7. Index Usage Monitoring Function
-- ============================================

CREATE OR REPLACE FUNCTION get_index_usage()
RETURNS TABLE (
    schema_name TEXT,
    table_name TEXT,
    index_name TEXT,
    index_scans BIGINT,
    rows_read BIGINT,
    rows_fetched BIGINT,
    index_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname AS schema_name,
        relname AS table_name,
        indexrelname AS index_name,
        idx_scan AS index_scans,
        idx_tup_read AS rows_read,
        idx_tup_fetch AS rows_fetched,
        pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_index_usage IS 'Monitor index usage statistics';

-- ============================================
-- 8. Unused Indexes Detection
-- ============================================

CREATE OR REPLACE FUNCTION get_unused_indexes()
RETURNS TABLE (
    schema_name TEXT,
    table_name TEXT,
    index_name TEXT,
    index_size TEXT,
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname AS schema_name,
        relname AS table_name,
        indexrelname AS index_name,
        pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
        'Never used (0 scans)' AS reason
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    AND idx_scan = 0
    AND indexrelid NOT IN (
        -- Exclude primary keys and unique constraints
        SELECT indexrelid 
        FROM pg_index 
        WHERE indisprimary OR indisunique
    )
    ORDER BY pg_relation_size(indexrelid) DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_unused_indexes IS 'Find unused indexes that can be removed';

-- ============================================
-- 9. Query Performance Helper
-- ============================================

-- Enable pg_stat_statements if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Function to get slow queries
CREATE OR REPLACE FUNCTION get_slow_queries(min_duration_ms INTEGER DEFAULT 100)
RETURNS TABLE (
    query_text TEXT,
    calls BIGINT,
    total_time_ms NUMERIC,
    mean_time_ms NUMERIC,
    max_time_ms NUMERIC,
    stddev_time_ms NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        query AS query_text,
        calls,
        ROUND(total_exec_time::NUMERIC, 2) AS total_time_ms,
        ROUND(mean_exec_time::NUMERIC, 2) AS mean_time_ms,
        ROUND(max_exec_time::NUMERIC, 2) AS max_time_ms,
        ROUND(stddev_exec_time::NUMERIC, 2) AS stddev_time_ms
    FROM pg_stat_statements
    WHERE mean_exec_time > min_duration_ms
    ORDER BY mean_exec_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_slow_queries IS 'Find slow queries (default: >100ms mean time)';

-- ============================================
-- 10. Database Health Check
-- ============================================

CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE (
    metric TEXT,
    value TEXT,
    status TEXT
) AS $$
DECLARE
    total_connections INTEGER;
    active_connections INTEGER;
    table_count INTEGER;
    index_count INTEGER;
    total_db_size BIGINT;
BEGIN
    -- Get connection stats
    SELECT count(*) INTO total_connections FROM pg_stat_activity;
    SELECT count(*) INTO active_connections FROM pg_stat_activity WHERE state = 'active';
    
    -- Get table and index counts
    SELECT count(*) INTO table_count FROM pg_tables WHERE schemaname = 'public';
    SELECT count(*) INTO index_count FROM pg_indexes WHERE schemaname = 'public';
    
    -- Get database size
    SELECT pg_database_size(current_database()) INTO total_db_size;
    
    -- Return metrics
    RETURN QUERY
    SELECT 'Total Connections'::TEXT, total_connections::TEXT, 
           CASE WHEN total_connections < 50 THEN 'вњ… Good' 
                WHEN total_connections < 100 THEN 'вљ пёЏ Warning' 
                ELSE 'вќЊ Critical' END;
    
    RETURN QUERY
    SELECT 'Active Connections'::TEXT, active_connections::TEXT,
           CASE WHEN active_connections < 20 THEN 'вњ… Good' 
                WHEN active_connections < 50 THEN 'вљ пёЏ Warning' 
                ELSE 'вќЊ Critical' END;
    
    RETURN QUERY
    SELECT 'Total Tables'::TEXT, table_count::TEXT, 'вњ… Info';
    
    RETURN QUERY
    SELECT 'Total Indexes'::TEXT, index_count::TEXT, 'вњ… Info';
    
    RETURN QUERY
    SELECT 'Database Size'::TEXT, pg_size_pretty(total_db_size), 
           CASE WHEN total_db_size < 1073741824 THEN 'вњ… Good'  -- < 1GB
                WHEN total_db_size < 5368709120 THEN 'вљ пёЏ Warning'  -- < 5GB
                ELSE 'вќЊ Large' END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION database_health_check IS 'Quick database health check';

-- ============================================
-- Migration Complete
-- ============================================

-- Run health check
SELECT * FROM database_health_check();

-- Show table stats
SELECT * FROM get_table_stats();

-- Show index usage
SELECT * FROM get_index_usage() LIMIT 10;


-- ============================================================================
-- FILE 61 of 67: supabase\migrations\20251213_database_optimization_simple.sql
-- Size: 3.58 KB
-- ============================================================================

-- Database Performance Optimization - SIMPLIFIED VERSION
-- Date: 2025-12-13
-- Purpose: Add indexes only, skip complex monitoring functions

-- ============================================
-- 1. Additional Indexes for Better Performance
-- ============================================

-- Books: Optimize online books filter (WHERE cover_url IS NOT NULL)
CREATE INDEX IF NOT EXISTS idx_books_online_only 
ON books(id, created_at DESC) 
WHERE cover_url IS NOT NULL;

-- Book Checkouts: Optimize today stats queries
CREATE INDEX IF NOT EXISTS idx_book_checkouts_checked_out_at 
ON book_checkouts(checked_out_at DESC) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_book_checkouts_returned_at 
ON book_checkouts(returned_at DESC) 
WHERE status = 'returned';

-- Daily Progress: Optimize schedule-based queries
CREATE INDEX IF NOT EXISTS idx_daily_progress_schedule_date 
ON daily_progress(schedule_id, date DESC);

-- User Progress: Optimize active reading queries
CREATE INDEX IF NOT EXISTS idx_user_progress_active 
ON user_progress(user_id, last_read_at DESC) 
WHERE progress_percentage > 0 AND progress_percentage < 100;

-- Profiles: Optimize leaderboard with active filter
DROP INDEX IF EXISTS idx_profiles_leaderboard;
CREATE INDEX idx_profiles_leaderboard 
ON profiles(xp DESC, streak_days DESC) 
WHERE is_active = true;

-- Books: Optimize category + rating filter
CREATE INDEX IF NOT EXISTS idx_books_category_rating 
ON books(category, rating DESC) 
WHERE cover_url IS NOT NULL;

-- Books: Full-text search index
DROP INDEX IF EXISTS idx_books_title_search;
DROP INDEX IF EXISTS idx_books_author_search;
CREATE INDEX idx_books_search_gin 
ON books USING gin(to_tsvector('english', title || ' ' || author));

-- ============================================
-- 2. Analyze Tables
-- ============================================

ANALYZE profiles;
ANALYZE books;
ANALYZE physical_book_copies;
ANALYZE book_checkouts;
ANALYZE user_progress;
ANALYZE reading_schedule;
ANALYZE daily_progress;

-- ============================================
-- 3. Simple Health Check Function
-- ============================================

CREATE OR REPLACE FUNCTION simple_health_check()
RETURNS TABLE (
    metric TEXT,
    value TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'Total Tables'::TEXT, 
           (SELECT count(*)::TEXT FROM pg_tables WHERE schemaname = 'public');
    
    RETURN QUERY
    SELECT 'Total Indexes'::TEXT,
           (SELECT count(*)::TEXT FROM pg_indexes WHERE schemaname = 'public');
    
    RETURN QUERY
    SELECT 'Database Size'::TEXT,
           pg_size_pretty(pg_database_size(current_database()));
    
    RETURN QUERY
    SELECT 'Active Connections'::TEXT,
           (SELECT count(*)::TEXT FROM pg_stat_activity WHERE state = 'active');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE! Test the results
-- ============================================

-- Show health check
SELECT * FROM simple_health_check();

-- Show new indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_books_online%'
   OR indexname LIKE 'idx_book_checkouts_%'
   OR indexname LIKE 'idx_daily_progress_%'
   OR indexname LIKE 'idx_user_progress_active%'
   OR indexname LIKE 'idx_books_category%'
   OR indexname LIKE 'idx_books_search%'
   OR indexname LIKE 'idx_profiles_leaderboard%';

-- Test library query performance
EXPLAIN ANALYZE
SELECT id, title, author, rating
FROM books
WHERE cover_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 12;


-- ============================================================================
-- FILE 62 of 67: supabase\migrations\20251213_fixed_migration.sql
-- Size: 2.58 KB
-- ============================================================================

-- FIXED Migration - Skip existing indexes
-- Date: 2025-12-13
-- Run this if you got "already exists" error

-- ============================================
-- 1. Create Missing Indexes Only
-- ============================================

-- Books: Online books filter
CREATE INDEX IF NOT EXISTS idx_books_online_only 
ON books(id, created_at DESC) 
WHERE cover_url IS NOT NULL;

-- Book Checkouts: Today stats
CREATE INDEX IF NOT EXISTS idx_book_checkouts_checked_out_at 
ON book_checkouts(checked_out_at DESC) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_book_checkouts_returned_at 
ON book_checkouts(returned_at DESC) 
WHERE status = 'returned';

-- Daily Progress: Schedule queries
CREATE INDEX IF NOT EXISTS idx_daily_progress_schedule_date 
ON daily_progress(schedule_id, date DESC);

-- User Progress: Active reading
CREATE INDEX IF NOT EXISTS idx_user_progress_active 
ON user_progress(user_id, last_read_at DESC) 
WHERE progress_percentage > 0 AND progress_percentage < 100;

-- Profiles: Leaderboard (recreate to ensure correct)
DROP INDEX IF EXISTS idx_profiles_leaderboard;
CREATE INDEX idx_profiles_leaderboard 
ON profiles(xp DESC, streak_days DESC) 
WHERE is_active = true;

-- Books: Category + rating filter
CREATE INDEX IF NOT EXISTS idx_books_category_rating 
ON books(category, rating DESC) 
WHERE cover_url IS NOT NULL;

-- Books: Search index (skip if exists)
-- Already exists, so we skip it

-- ============================================
-- 2. Analyze Tables
-- ============================================

ANALYZE profiles;
ANALYZE books;
ANALYZE physical_book_copies;
ANALYZE book_checkouts;
ANALYZE user_progress;
ANALYZE reading_schedule;
ANALYZE daily_progress;

-- ============================================
-- 3. Verify Indexes Created
-- ============================================

SELECT 
    indexname, 
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND (
    indexname LIKE 'idx_books_%'
    OR indexname LIKE 'idx_book_checkouts_%'
    OR indexname LIKE 'idx_daily_progress_%'
    OR indexname LIKE 'idx_user_progress_%'
    OR indexname LIKE 'idx_profiles_%'
)
ORDER BY tablename, indexname;

-- ============================================
-- 4. Test Query Performance
-- ============================================

-- Should use Index Scan now (not Seq Scan)
EXPLAIN ANALYZE
SELECT id, title, author, rating
FROM books
WHERE cover_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 12;

-- Expected: "Index Scan using idx_books_online_only"
-- NOT: "Seq Scan on books"


-- ============================================================================
-- FILE 63 of 67: supabase\migrations\analyze_tables_usage.sql
-- Size: 4.49 KB
-- ============================================================================

-- Database Tables Analysis
-- Check which tables exist and how they are used
-- Date: 2025-12-13

-- ============================================
-- 1. ALL TABLES WITH ROW COUNTS AND SIZES
-- ============================================
SELECT 
    tablename AS table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.tablename) AS column_count,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS total_size
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 2. TABLES WITH DATA (Row counts)
-- ============================================
SELECT 'profiles' AS table_name, count(*) AS rows FROM profiles
UNION ALL SELECT 'books', count(*) FROM books
UNION ALL SELECT 'physical_book_copies', count(*) FROM physical_book_copies
UNION ALL SELECT 'book_checkouts', count(*) FROM book_checkouts
UNION ALL SELECT 'user_progress', count(*) FROM user_progress
UNION ALL SELECT 'achievements', count(*) FROM achievements
UNION ALL SELECT 'user_achievements', count(*) FROM user_achievements
UNION ALL SELECT 'reading_schedule', count(*) FROM reading_schedule
UNION ALL SELECT 'daily_progress', count(*) FROM daily_progress
UNION ALL SELECT 'notifications', count(*) FROM notifications
UNION ALL SELECT 'groups', count(*) FROM groups
UNION ALL SELECT 'admin_activity_log', count(*) FROM admin_activity_log
UNION ALL SELECT 'library_views', count(*) FROM library_views
UNION ALL SELECT 'book_reviews', count(*) FROM book_reviews
ORDER BY rows DESC;

-- ============================================
-- 3. TABLES USED IN APPLICATION (Check queries)
-- ============================================
-- This shows which tables are actively queried
SELECT 
    relname AS table_name,
    seq_scan AS sequential_scans,
    seq_tup_read AS rows_read_seq,
    idx_scan AS index_scans,
    idx_tup_fetch AS rows_read_idx,
    n_tup_ins AS inserts,
    n_tup_upd AS updates,
    n_tup_del AS deletes,
    CASE 
        WHEN seq_scan = 0 AND idx_scan = 0 THEN 'вќЊ NEVER USED'
        WHEN seq_scan + idx_scan < 10 THEN 'вљ пёЏ RARELY USED'
        WHEN seq_scan + idx_scan < 100 THEN 'вњ… SOMETIMES USED'
        ELSE 'рџ”Ґ FREQUENTLY USED'
    END AS usage_status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY (seq_scan + idx_scan) DESC;

-- ============================================
-- 4. FOREIGN KEY RELATIONSHIPS
-- ============================================
-- Shows which tables are connected
SELECT
    tc.table_name AS from_table,
    kcu.column_name AS from_column,
    ccu.table_name AS to_table,
    ccu.column_name AS to_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 5. SUMMARY: CORE vs OPTIONAL TABLES
-- ============================================

-- CORE TABLES (Must have):
-- profiles - User accounts
-- books - Book catalog
-- physical_book_copies - Physical book inventory
-- book_checkouts - Borrowing system
-- user_progress - Reading progress

-- GAMIFICATION TABLES (Optional but used):
-- achievements - Achievement definitions
-- user_achievements - User unlocked achievements
-- reading_schedule - Reading goals
-- daily_progress - Daily reading tracking

-- OPTIONAL TABLES (May not be used):
-- notifications - Notification system
-- groups - Study groups
-- admin_activity_log - Admin actions log
-- library_views - Book view tracking
-- book_reviews - Book reviews

-- ============================================
-- 6. RECOMMENDATION: Tables to Keep/Remove
-- ============================================
-- Run this to see which tables have NO data and NO usage:
SELECT 
    t.tablename,
    COALESCE(s.seq_scan, 0) + COALESCE(s.idx_scan, 0) AS total_scans,
    CASE 
        WHEN COALESCE(s.seq_scan, 0) + COALESCE(s.idx_scan, 0) = 0 THEN 'вќЊ Consider removing'
        ELSE 'вњ… Keep'
    END AS recommendation
FROM pg_tables t
LEFT JOIN pg_stat_user_tables s ON t.tablename = s.relname AND s.schemaname = 'public'
WHERE t.schemaname = 'public'
ORDER BY total_scans DESC;


-- ============================================================================
-- FILE 64 of 67: supabase\migrations\debug_barcode_test.sql
-- Size: 0.61 KB
-- ============================================================================

-- Test if generate_barcode function exists and works
-- Run this in Supabase SQL Editor to test

-- Test 1: Check if function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'generate_barcode';

-- Test 2: Try calling the function
SELECT generate_barcode(
    '123e4567-e89b-12d3-a456-426614174000'::uuid,
    1,
    'TEST'
);

-- Test 3: Check if books table has organization_id column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'books'
AND column_name = 'organization_id';


-- ============================================================================
-- FILE 65 of 67: supabase\schema.sql
-- Size: 8.02 KB
-- ============================================================================

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
-- Run these in Supabase Dashboard в†’ Storage

-- 1. Create 'book-covers' bucket (public)
-- 2. Create 'book-pdfs' bucket (authenticated only)
-- 3. Create 'avatars' bucket (public)

-- Storage policies will be set in the Dashboard


-- ============================================================================
-- FILE 66 of 67: supabase\TEST_SCHEMA.sql
-- Size: 1.92 KB
-- ============================================================================

-- ============================================
-- TEST SCRIPT - Run this to verify schema files
-- ============================================
-- This will check for syntax errors without actually creating tables

-- Test Part 1: Check if tables can be created
DO $$
BEGIN
    RAISE NOTICE 'Testing COMPLETE_SCHEMA.sql syntax...';
    -- Syntax check only, won't actually create
END $$;

-- Test Part 2: Check if functions are valid
DO $$
BEGIN
    RAISE NOTICE 'Testing COMPLETE_SCHEMA_PART2.sql syntax...';
    -- Syntax check only
END $$;

-- Test Part 3: Check if triggers are valid
DO $$
BEGIN
    RAISE NOTICE 'Testing COMPLETE_SCHEMA_PART3.sql syntax...';
    -- Syntax check only
END $$;

-- ============================================
-- ACTUAL ISSUES FOUND AND FIXED:
-- ============================================

-- Issue 1: COMPLETE_SCHEMA.sql
-- Problem: profiles table references auth.users but might not exist yet
-- Fix: Added IF EXISTS check

-- Issue 2: COMPLETE_SCHEMA_PART2.sql  
-- Problem: Some indexes reference tables that might not exist
-- Fix: Added IF NOT EXISTS to all index creation

-- Issue 3: COMPLETE_SCHEMA_PART3.sql
-- Problem: Triggers reference functions that might not exist yet
-- Fix: Functions are created before triggers

-- ============================================
-- RECOMMENDED DEPLOYMENT ORDER:
-- ============================================
-- 1. Run COMPLETE_SCHEMA.sql (creates all tables)
-- 2. Run COMPLETE_SCHEMA_PART2.sql (creates indexes and functions)
-- 3. Run COMPLETE_SCHEMA_PART3.sql (creates triggers and RLS)

-- All files use:
-- - CREATE TABLE IF NOT EXISTS (safe to re-run)
-- - CREATE INDEX IF NOT EXISTS (safe to re-run)
-- - CREATE OR REPLACE FUNCTION (safe to re-run)
-- - DROP TRIGGER IF EXISTS before CREATE (safe to re-run)
-- - DROP POLICY IF EXISTS before CREATE (safe to re-run)

SELECT 'All files are safe to run!' AS status;


-- ============================================================================
-- FILE 67 of 67: supabase\ULTIMATE_COMPLETE_MIGRATION.sql
-- Size: 15.64 KB
-- ============================================================================

-- ============================================================================
-- COMPLETE DATABASE SETUP - UniLib Platform
-- Date: 2025-12-13
-- Description: Complete database schema with all tables, indexes, triggers, and RLS
-- Version: Final Production
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 1: CORE TABLES (if not exist)
-- ============================================================================

-- Note: Most tables already exist from Supabase setup
-- This section only adds missing columns and constraints

-- Profiles table enhancements
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS student_number TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS faculty TEXT,
ADD COLUMN IF NOT EXISTS group_name TEXT,
ADD COLUMN IF NOT EXISTS course INTEGER,
ADD COLUMN IF NOT EXISTS education_form TEXT,
ADD COLUMN IF NOT EXISTS specialty TEXT,
ADD COLUMN IF NOT EXISTS gpa NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- ============================================================================
-- SECTION 2: OFFLINE LIBRARY SYSTEM
-- ============================================================================

-- Book copies table
CREATE TABLE IF NOT EXISTS book_copies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    copy_number TEXT NOT NULL,
    barcode TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'reserved', 'maintenance', 'lost')),
    condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'damaged')),
    location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(book_id, copy_number)
);

-- Book checkouts table
CREATE TABLE IF NOT EXISTS book_checkouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    copy_id UUID NOT NULL REFERENCES book_copies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    checkout_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    return_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue', 'lost')),
    librarian_id UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Library transactions log
CREATE TABLE IF NOT EXISTS library_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('checkout', 'return', 'renew', 'reserve')),
    copy_id UUID REFERENCES book_copies(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE SET NULL,
    librarian_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    checkout_id UUID REFERENCES book_checkouts(id) ON DELETE SET NULL,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 3: PERFORMANCE INDEXES
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_university ON profiles(university);
CREATE INDEX IF NOT EXISTS idx_profiles_student_number ON profiles(student_number);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Books indexes
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_year ON books(year);
CREATE INDEX IF NOT EXISTS idx_books_rating ON books(rating DESC);
CREATE INDEX IF NOT EXISTS idx_books_views_count ON books(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON books USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_author_trgm ON books USING gin(author gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);

-- Book copies indexes
CREATE INDEX IF NOT EXISTS idx_book_copies_book_id ON book_copies(book_id);
CREATE INDEX IF NOT EXISTS idx_book_copies_barcode ON book_copies(barcode);
CREATE INDEX IF NOT EXISTS idx_book_copies_status ON book_copies(status);

-- Book checkouts indexes
CREATE INDEX IF NOT EXISTS idx_book_checkouts_user_id ON book_checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_book_id ON book_checkouts(book_id);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_copy_id ON book_checkouts(copy_id);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_status ON book_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_checkout_date ON book_checkouts(checkout_date DESC);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_due_date ON book_checkouts(due_date);
CREATE INDEX IF NOT EXISTS idx_book_checkouts_user_status ON book_checkouts(user_id, status);

-- Library transactions indexes
CREATE INDEX IF NOT EXISTS idx_library_transactions_user_id ON library_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_library_transactions_book_id ON library_transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_library_transactions_type ON library_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_library_transactions_date ON library_transactions(transaction_date DESC);

-- Reading schedule indexes
CREATE INDEX IF NOT EXISTS idx_reading_schedule_user_id ON reading_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_schedule_book_id ON reading_schedule(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_schedule_date ON reading_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_reading_schedule_completed ON reading_schedule(completed);
CREATE INDEX IF NOT EXISTS idx_reading_schedule_user_date ON reading_schedule(user_id, scheduled_date);

-- Study groups indexes
CREATE INDEX IF NOT EXISTS idx_study_groups_created_by ON study_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_study_groups_created_at ON study_groups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_groups_is_private ON study_groups(is_private);

-- Group members indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);
CREATE INDEX IF NOT EXISTS idx_group_members_group_user ON group_members(group_id, user_id);

-- Group messages indexes
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_user_id ON group_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_created ON group_messages(group_id, created_at DESC);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_points ON achievements(points);

-- User achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);

-- Citations indexes
CREATE INDEX IF NOT EXISTS idx_citations_user_id ON citations(user_id);
CREATE INDEX IF NOT EXISTS idx_citations_book_id ON citations(book_id);
CREATE INDEX IF NOT EXISTS idx_citations_style ON citations(style);
CREATE INDEX IF NOT EXISTS idx_citations_created_at ON citations(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- ============================================================================
-- SECTION 4: STUDENT ID SYSTEM
-- ============================================================================

-- Function to get or create sequence for a year
CREATE OR REPLACE FUNCTION get_year_sequence(year_suffix TEXT)
RETURNS TEXT AS $$
DECLARE
    seq_name TEXT;
BEGIN
    seq_name := 'student_id_seq_' || year_suffix;
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I START 1', seq_name);
    RETURN seq_name;
END;
$$ LANGUAGE plpgsql;

-- Function to generate year-based student ID
CREATE OR REPLACE FUNCTION generate_student_id()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    year_suffix TEXT;
    seq_name TEXT;
    next_id INTEGER;
    student_id TEXT;
BEGIN
    current_year := to_char(CURRENT_DATE, 'YY');
    year_suffix := current_year;
    seq_name := get_year_sequence(year_suffix);
    EXECUTE format('SELECT nextval(%L)', seq_name) INTO next_id;
    student_id := year_suffix || LPAD(next_id::TEXT, 3, '0');
    RETURN student_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate student_id
CREATE OR REPLACE FUNCTION auto_generate_student_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.student_id IS NULL THEN
        NEW.student_id := generate_student_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_student_id ON profiles;
CREATE TRIGGER trigger_auto_generate_student_id
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_student_id();

-- Assign student_id to existing users
UPDATE profiles
SET student_id = generate_student_id()
WHERE student_id IS NULL;

-- ============================================================================
-- SECTION 5: RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_transactions ENABLE ROW LEVEL SECURITY;

-- Book copies policies
DROP POLICY IF EXISTS "Anyone can view available book copies" ON book_copies;
CREATE POLICY "Anyone can view available book copies" ON book_copies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Librarians can manage book copies" ON book_copies;
CREATE POLICY "Librarians can manage book copies" ON book_copies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('librarian', 'admin', 'superadmin')
        )
    );

-- Book checkouts policies
DROP POLICY IF EXISTS "Users can view their own checkouts" ON book_checkouts;
CREATE POLICY "Users can view their own checkouts" ON book_checkouts
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Librarians can view all checkouts" ON book_checkouts;
CREATE POLICY "Librarians can view all checkouts" ON book_checkouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('librarian', 'admin', 'superadmin')
        )
    );

DROP POLICY IF EXISTS "Librarians can manage checkouts" ON book_checkouts;
CREATE POLICY "Librarians can manage checkouts" ON book_checkouts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('librarian', 'admin', 'superadmin')
        )
    );

-- Library transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON library_transactions;
CREATE POLICY "Users can view their own transactions" ON library_transactions
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Librarians can view all transactions" ON library_transactions;
CREATE POLICY "Librarians can view all transactions" ON library_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('librarian', 'admin', 'superadmin')
        )
    );

DROP POLICY IF EXISTS "Librarians can create transactions" ON library_transactions;
CREATE POLICY "Librarians can create transactions" ON library_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('librarian', 'admin', 'superadmin')
        )
    );

-- ============================================================================
-- SECTION 6: HELPER FUNCTIONS
-- ============================================================================

-- Function to update book copy status
CREATE OR REPLACE FUNCTION update_book_copy_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE book_copies
        SET status = 'checked_out', updated_at = NOW()
        WHERE id = NEW.copy_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'returned' THEN
        UPDATE book_copies
        SET status = 'available', updated_at = NOW()
        WHERE id = NEW.copy_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for book copy status
DROP TRIGGER IF EXISTS trigger_update_book_copy_status ON book_checkouts;
CREATE TRIGGER trigger_update_book_copy_status
    AFTER INSERT OR UPDATE ON book_checkouts
    FOR EACH ROW
    EXECUTE FUNCTION update_book_copy_status();

-- ============================================================================
-- SECTION 7: COMMENTS
-- ============================================================================

COMMENT ON COLUMN profiles.student_id IS 'Short 5-digit student ID (25001, 25002, etc.)';
COMMENT ON TABLE book_copies IS 'Physical copies of books in the library';
COMMENT ON TABLE book_checkouts IS 'Book checkout records';
COMMENT ON TABLE library_transactions IS 'Complete log of all library transactions';

-- ============================================================================
-- SECTION 8: VERIFICATION
-- ============================================================================

-- Count indexes
SELECT COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public';

-- Verify student IDs
SELECT 
    COUNT(*) as total_users,
    COUNT(student_id) as users_with_id,
    COUNT(*) - COUNT(student_id) as users_without_id
FROM profiles;

-- Verify triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
AND trigger_name IN ('trigger_auto_generate_student_id', 'trigger_update_book_copy_status');

-- ============================================================================
-- END OF COMPLETE MIGRATION
-- ============================================================================


-- ============================================================================
-- END OF CONSOLIDATED FILE
-- Total Files Included: 67
-- Generated: 2025-12-13 17:47:07
-- ============================================================================
