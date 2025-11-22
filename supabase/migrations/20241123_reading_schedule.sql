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
