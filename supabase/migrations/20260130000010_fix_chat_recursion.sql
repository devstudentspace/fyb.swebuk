-- Fix infinite recursion in project_chat policies by using a security definer function

-- Function to check project membership bypassing RLS
CREATE OR REPLACE FUNCTION public.check_is_project_member(_project_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = _project_id
    AND user_id = _user_id
    AND status = 'approved'
  );
END;
$$;

-- Function to check cluster membership bypassing RLS (just in case)
CREATE OR REPLACE FUNCTION public.check_is_cluster_member_for_project(_project_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects p
    JOIN cluster_members cm ON p.cluster_id = cm.cluster_id
    WHERE p.id = _project_id
    AND cm.user_id = _user_id
    AND cm.status = 'approved'
  );
END;
$$;

-- Update INSERT policy
DROP POLICY IF EXISTS "Project members can send messages" ON project_chat;

CREATE POLICY "Project members can send messages" ON project_chat
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    user_id = auth.uid() AND
    (
      -- Owner check (projects usually ok to query, but let's be safe: query projects directly? 
      -- projects RLS might recurse too. Let's trust projects RLS is optimized or use function if needed.
      -- Usually projects RLS is the root.
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_chat.project_id
        AND projects.owner_id = auth.uid()
      ) OR
      -- Use function to bypass RLS recursion on members
      check_is_project_member(project_chat.project_id, auth.uid()) OR
      check_is_cluster_member_for_project(project_chat.project_id, auth.uid()) OR
      -- Admin check
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    )
  );

-- Update SELECT policy
DROP POLICY IF EXISTS "Project members can view chat" ON project_chat;

CREATE POLICY "Project members can view chat" ON project_chat
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_chat.project_id
      AND projects.owner_id = auth.uid()
    ) OR
    check_is_project_member(project_chat.project_id, auth.uid()) OR
    check_is_cluster_member_for_project(project_chat.project_id, auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Update UPDATE policy
DROP POLICY IF EXISTS "Project members can update chat" ON project_chat;

CREATE POLICY "Project members can update chat" ON project_chat
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    (
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_chat.project_id
        AND projects.owner_id = auth.uid()
      ) OR
      check_is_project_member(project_chat.project_id, auth.uid()) OR
      check_is_cluster_member_for_project(project_chat.project_id, auth.uid())
    )
  );
