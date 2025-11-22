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
