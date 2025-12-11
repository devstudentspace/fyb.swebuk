-- Create projects table
create table projects (
  id uuid default gen_random_uuid() not null primary key,
  name text not null,
  description text,
  type text not null check (type in ('personal', 'cluster')),
  visibility text default 'public' check (visibility in ('public', 'private')),
  status text default 'active' check (status in ('active', 'completed', 'archived', 'on_hold')),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  cluster_id uuid references public.clusters(id) on delete cascade,
  repository_url text,
  demo_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  constraint cluster_project_must_have_cluster check (
    (type = 'cluster' and cluster_id is not null) or
    (type = 'personal' and cluster_id is null)
  )
);

-- Create project_members table
create table project_members (
  id uuid default gen_random_uuid() not null primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'maintainer', 'member')),
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  joined_at timestamptz default now() not null,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  contribution_notes text,
  unique(project_id, user_id)
);

-- Create project_tags table
create table project_tags (
  id uuid default gen_random_uuid() not null primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  tag text not null,
  created_at timestamptz default now() not null,
  unique(project_id, tag)
);

-- Enable RLS
alter table projects enable row level security;
alter table project_members enable row level security;
alter table project_tags enable row level security;

-- Projects policies
create policy "Anyone can view public projects" on projects
  for select using (
    visibility = 'public' or
    owner_id = auth.uid() or
    exists (
      select 1 from project_members
      where project_members.project_id = projects.id
      and project_members.user_id = auth.uid()
      and project_members.status = 'approved'
    ) or
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'staff')
    )
  );

create policy "Authenticated users can create personal projects" on projects
  for insert with check (
    auth.role() = 'authenticated' and
    owner_id = auth.uid() and
    type = 'personal'
  );

create policy "Cluster leads, deputies, staff managers, and admins can create cluster projects" on projects
  for insert with check (
    auth.role() = 'authenticated' and
    type = 'cluster' and
    (
      exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'staff')) or
      exists (
        select 1 from clusters
        where clusters.id = projects.cluster_id and
        (clusters.lead_id = auth.uid() or
         clusters.deputy_id = auth.uid() or
         clusters.staff_manager_id = auth.uid())
      )
    )
  );

create policy "Project owners and admins can update projects" on projects
  for update using (
    auth.role() = 'authenticated' and (
      owner_id = auth.uid() or
      exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    )
  );

create policy "Project owners and admins can delete projects" on projects
  for delete using (
    auth.role() = 'authenticated' and (
      owner_id = auth.uid() or
      exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    )
  );

-- Project members policies
create policy "Anyone can view approved project members" on project_members
  for select using (
    status = 'approved' or
    user_id = auth.uid() or
    exists (
      select 1 from projects
      where projects.id = project_members.project_id
      and projects.owner_id = auth.uid()
    ) or
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'staff'))
  );

create policy "Users can request to join projects" on project_members
  for insert with check (
    auth.role() = 'authenticated' and
    user_id = auth.uid() and
    status = 'pending' and
    role = 'member'
  );

create policy "Project owners and admins can manage members" on project_members
  for all using (
    auth.role() = 'authenticated' and (
      exists (
        select 1 from projects
        where projects.id = project_members.project_id
        and projects.owner_id = auth.uid()
      ) or
      exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    )
  );

-- Project tags policies
create policy "Anyone can view project tags" on project_tags
  for select using (true);

create policy "Project owners and members can add tags" on project_tags
  for insert with check (
    auth.role() = 'authenticated' and (
      exists (
        select 1 from projects
        where projects.id = project_tags.project_id
        and projects.owner_id = auth.uid()
      ) or
      exists (
        select 1 from project_members
        where project_members.project_id = project_tags.project_id
        and project_members.user_id = auth.uid()
        and project_members.status = 'approved'
      )
    )
  );

create policy "Project owners can delete tags" on project_tags
  for delete using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from projects
      where projects.id = project_tags.project_id
      and projects.owner_id = auth.uid()
    )
  );

-- Create indexes
create index projects_owner_id_idx on projects(owner_id);
create index projects_cluster_id_idx on projects(cluster_id);
create index projects_type_idx on projects(type);
create index projects_status_idx on projects(status);
create index projects_visibility_idx on projects(visibility);
create index project_members_project_id_idx on project_members(project_id);
create index project_members_user_id_idx on project_members(user_id);
create index project_members_status_idx on project_members(status);
create index project_tags_project_id_idx on project_tags(project_id);
create index project_tags_tag_idx on project_tags(tag);

-- Trigger to update updated_at
create trigger update_projects_updated_at
  before update on projects
  for each row execute procedure update_updated_at_column();
