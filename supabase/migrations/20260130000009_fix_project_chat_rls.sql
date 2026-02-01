-- Update project_chat INSERT policy to include admins and cluster members
DROP POLICY IF EXISTS "Project members can send messages" ON project_chat;

CREATE POLICY "Project members can send messages" ON project_chat
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    user_id = auth.uid() AND
    (
      -- Check if user is owner, member, or cluster member
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_chat.project_id
        AND (
          projects.owner_id = auth.uid() OR
          -- Check for direct membership
          EXISTS (
            SELECT 1 FROM project_members
            WHERE project_members.project_id = projects.id
            AND project_members.user_id = auth.uid()
            AND project_members.status = 'approved'
          ) OR
          -- Check for cluster membership if it's a cluster project
          (
            projects.cluster_id IS NOT NULL AND
            EXISTS (
              SELECT 1 FROM cluster_members
              WHERE cluster_members.cluster_id = projects.cluster_id
              AND cluster_members.user_id = auth.uid()
              AND cluster_members.status = 'approved'
            )
          )
        )
      ) OR
      -- Check for Admin role
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    )
  );

-- Update SELECT policy to match (so they can read what they send)
DROP POLICY IF EXISTS "Project members can view chat" ON project_chat;

CREATE POLICY "Project members can view chat" ON project_chat
  FOR SELECT USING (
    -- Check if user is owner, member, or cluster member
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_chat.project_id
      AND (
        projects.owner_id = auth.uid() OR
        -- projects.visibility = 'public' OR -- Maybe allow public viewing? No, chat usually private. Sticking to members.
        -- Check for direct membership
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.user_id = auth.uid()
          AND project_members.status = 'approved'
        ) OR
        -- Check for cluster membership
        (
          projects.cluster_id IS NOT NULL AND
          EXISTS (
            SELECT 1 FROM cluster_members
            WHERE cluster_members.cluster_id = projects.cluster_id
            AND cluster_members.user_id = auth.uid()
            AND cluster_members.status = 'approved'
          )
        )
      )
    ) OR
    -- Check for Admin/Staff role
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );
