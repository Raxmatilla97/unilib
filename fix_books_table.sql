-- Fix books table organization_id constraint
-- Run this SQL in Supabase SQL Editor

-- Option 1: Make organization_id nullable (RECOMMENDED)
ALTER TABLE books 
ALTER COLUMN organization_id DROP NOT NULL;

-- Option 2: Set a default value (if you have a default organization)
-- First, create a default organization if it doesn't exist:
-- INSERT INTO organizations (id, name) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Default Organization')
-- ON CONFLICT (id) DO NOTHING;

-- Then set default:
-- ALTER TABLE books 
-- ALTER COLUMN organization_id SET DEFAULT '00000000-0000-0000-0000-000000000000';

-- Option 3: Remove the column entirely (if not needed)
-- ALTER TABLE books DROP COLUMN organization_id;

-- RECOMMENDED: Use Option 1 (make nullable)
