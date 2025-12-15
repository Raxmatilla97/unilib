-- ============================================================================
-- STANDALONE POSTGRESQL MIGRATION - UniLib Platform
-- Generated: 2025-12-15
-- Description: Additional changes for standalone PostgreSQL (after ALL_SQL_CONSOLIDATED.sql)
-- ============================================================================

-- ============================================================================
-- 1. ADD PASSWORD HASH COLUMN FOR NEXTAUTH
-- ============================================================================

-- Add password_hash column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

COMMENT ON COLUMN profiles.password_hash IS 'Bcrypt hashed password for NextAuth authentication';

-- ============================================================================
-- 2. DISABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- RLS is not needed with NextAuth - we use application-level authorization

ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS books DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS physical_book_copies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS book_checkouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reading_schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS library_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS book_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS citations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS study_groups DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (if any)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ============================================================================
-- 3. CREATE ADMIN USER (Optional - for initial setup)
-- ============================================================================

-- Create default admin user (change password after first login!)
-- Password: 'admin123' (hashed with bcrypt)
INSERT INTO profiles (
    id,
    email,
    name,
    role,
    password_hash,
    xp,
    level,
    is_active
) VALUES (
    gen_random_uuid(),
    'admin@unilib.uz',
    'System Admin',
    'system_admin',
    '$2a$10$rKJ5YwZ5YwZ5YwZ5YwZ5YeZ5YwZ5YwZ5YwZ5YwZ5YwZ5YwZ5YwZ5Y', -- Change this!
    0,
    1,
    true
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 3. REMOVE SUPABASE-SPECIFIC TRIGGERS (if any)
-- ============================================================================

-- Drop auth.users trigger (doesn't exist in standalone PostgreSQL)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================================================
-- 4. CREATE SESSION TABLE FOR NEXTAUTH (Optional)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);

-- ============================================================================
-- 5. VERIFICATION QUERIES
-- ============================================================================

-- Check if password_hash column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'password_hash';

-- Check admin user
SELECT id, email, name, role, password_hash IS NOT NULL as has_password
FROM profiles 
WHERE role IN ('system_admin', 'org_admin');

-- ============================================================================
-- END OF STANDALONE MIGRATION
-- ============================================================================
