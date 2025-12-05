
-- Create the project_status enum type
CREATE TYPE project_status AS ENUM ('recruiting', 'in_progress', 'completed', 'archived');

-- Create the membership_status enum type
CREATE TYPE membership_status AS ENUM ('pending', 'approved', 'rejected', 'left');

-- Create the project_member_role enum type
CREATE TYPE project_member_role AS ENUM ('member', 'maintainer', 'owner');

-- Create the projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cluster_id UUID REFERENCES public.clusters(id) ON DELETE SET NULL,
    is_public BOOLEAN NOT NULL DEFAULT true,
    status project_status NOT NULL DEFAULT 'recruiting'
);

-- Create the project_members table
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    membership_status membership_status NOT NULL DEFAULT 'pending',
    role project_member_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, user_id)
);

-- Enable RLS for the new tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects table
-- 1. Allow public read access for all projects that are marked as public
CREATE POLICY "Allow public read access to public projects"
ON public.projects
FOR SELECT
USING (is_public = true);

-- 2. Allow members to view projects they are part of (even if not public)
CREATE POLICY "Allow members to view their projects"
ON public.projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM project_members pm
    WHERE pm.project_id = id
    AND pm.user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND pm.membership_status = 'approved'
  )
);

-- 3. Allow users to create new projects
CREATE POLICY "Allow authenticated users to create projects"
ON public.projects
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 4. Allow project owners to update their projects
CREATE POLICY "Allow project owners to update their projects"
ON public.projects
FOR UPDATE
USING (
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()) = owner_id
)
WITH CHECK (
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()) = owner_id
);


-- 5. Allow project owners to delete their projects
CREATE POLICY "Allow project owners to delete their projects"
ON public.projects
FOR DELETE
USING (
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()) = owner_id
);


-- RLS Policies for project_members
-- 1. Allow users to see their own membership status
CREATE POLICY "Allow users to see their own membership"
ON public.project_members
FOR SELECT
USING (
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()) = user_id
);

-- 2. Allow members of a project to see other approved members
CREATE POLICY "Allow project members to see other members"
ON public.project_members
FOR SELECT
USING (
  membership_status = 'approved' AND EXISTS (
    SELECT 1
    FROM project_members pm
    WHERE pm.project_id = project_members.project_id
    AND pm.user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND pm.membership_status = 'approved'
  )
);

-- 3. Allow project owners to see all members and requests for their project
CREATE POLICY "Allow project owners to view all members and requests"
ON public.project_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM projects p
    WHERE p.id = project_members.project_id
    AND p.owner_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);


-- 4. Allow users to request to join a project
CREATE POLICY "Allow users to request to join projects"
ON public.project_members
FOR INSERT
WITH CHECK (
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()) = user_id AND membership_status = 'pending'
);

-- 5. Allow project owners to manage memberships (add, approve, reject)
CREATE POLICY "Allow project owners to manage members"
ON public.project_members
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM projects p
    WHERE p.id = project_members.project_id
    AND p.owner_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
)
WITH CHECK (
    EXISTS (
    SELECT 1
    FROM projects p
    WHERE p.id = project_members.project_id
    AND p.owner_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);


-- 6. Allow users to leave a project or cancel a request
CREATE POLICY "Allow users to leave projects or cancel requests"
ON public.project_members
FOR DELETE
USING (
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()) = user_id
);

-- Function to get the profile ID for the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_profile_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM public.profiles WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
