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
