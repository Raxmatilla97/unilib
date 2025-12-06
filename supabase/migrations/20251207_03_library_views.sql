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
