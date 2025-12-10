-- Add last_synced_at column to track when HEMIS data was last synced
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
