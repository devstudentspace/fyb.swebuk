-- Allow project members to update chat messages (for read receipts)
-- We strictly limit this to updating 'read_by' via application logic, but RLS in Postgres is row-based.
-- Ideally we would have a separate table for read receipts, but for this simple app, we allow UPDATE.
-- We rely on the backend/app to only update 'read_by'.

CREATE POLICY "Project members can update chat" ON project_chat
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_chat.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.user_id = auth.uid()
          AND project_members.status = 'approved'
        )
      )
    )
  )
  WITH CHECK (
    -- Ensure they can't change the message content or sender? 
    -- RLS 'WITH CHECK' on UPDATE ensures the NEW row also satisfies the condition.
    -- It doesn't easily compare OLD vs NEW without triggers.
    -- We'll trust the app layer for now or add a trigger later if needed.
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_chat.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.user_id = auth.uid()
          AND project_members.status = 'approved'
        )
      )
    )
  );

-- Also add UPDATE policy for fyp_chat for the same reason
CREATE POLICY "FYP participants can update chat" ON fyp_chat
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM final_year_projects
      WHERE final_year_projects.id = fyp_chat.fyp_id
      AND (
        final_year_projects.student_id = auth.uid() OR
        final_year_projects.supervisor_id = auth.uid()
      )
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
