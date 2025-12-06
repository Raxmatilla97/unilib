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
