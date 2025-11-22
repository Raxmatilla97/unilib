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
('first_day', 'Birinchi Kun', 'Birinchi marta kunlik maqsadni bajardingiz!', '🎯', 50, 'bronze', 'daily_goal', 1),
('streak_3', '3 Kunlik Streak', '3 kun ketma-ket o''qidingiz!', '🔥', 100, 'bronze', 'streak', 3),
('streak_7', 'Haftalik Warrior', '7 kun ketma-ket o''qidingiz!', '🔥', 250, 'silver', 'streak', 7),
('streak_30', 'Oylik Master', '30 kun ketma-ket o''qidingiz!', '🔥', 1000, 'gold', 'streak', 30),
('streak_100', 'Yuz Kunlik Legend', '100 kun ketma-ket o''qidingiz!', '🔥', 5000, 'platinum', 'streak', 100);

-- Book Completion Achievements
INSERT INTO achievements (key, title, description, icon, xp_reward, tier, requirement_type, requirement_value) VALUES
('first_book', 'Birinchi Kitob', 'Birinchi kitobingizni tugatdingiz!', '📖', 100, 'bronze', 'books_completed', 1),
('bookworm', 'Kitobxon', '5 ta kitobni tugatdingiz!', '📚', 300, 'silver', 'books_completed', 5),
('scholar', 'Olim', '10 ta kitobni tugatdingiz!', '🎓', 600, 'gold', 'books_completed', 10),
('library_master', 'Kutubxona Ustasi', '25 ta kitobni tugatdingiz!', '🏆', 1500, 'platinum', 'books_completed', 25);

-- Page Reading Achievements
INSERT INTO achievements (key, title, description, icon, xp_reward, tier, requirement_type, requirement_value) VALUES
('century_reader', 'Yuz Sahifa', '100 sahifa o''qidingiz!', '📄', 50, 'bronze', 'pages_read', 100),
('thousand_pages', 'Ming Sahifa', '1000 sahifa o''qidingiz!', '📄', 200, 'silver', 'pages_read', 1000),
('epic_reader', 'Epik O''quvchi', '5000 sahifa o''qidingiz!', '📄', 500, 'gold', 'pages_read', 5000),
('mega_reader', 'Mega O''quvchi', '10000 sahifa o''qidingiz!', '📄', 1000, 'platinum', 'pages_read', 10000);

-- Daily Goal Achievements
INSERT INTO achievements (key, title, description, icon, xp_reward, tier, requirement_type, requirement_value) VALUES
('perfectionist', 'Perfeksionist', '10 marta kunlik maqsadni bajardingiz!', '🎯', 200, 'silver', 'daily_goal', 10),
('dedicated', 'Sadoqatli', '30 marta kunlik maqsadni bajardingiz!', '🎯', 500, 'gold', 'daily_goal', 30),
('unstoppable', 'To''xtovsiz', '100 marta kunlik maqsadni bajardingiz!', '🎯', 1500, 'platinum', 'daily_goal', 100);

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
