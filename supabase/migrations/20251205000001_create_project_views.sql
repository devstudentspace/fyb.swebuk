-- Create view for detailed projects with owner and cluster info
create or replace view detailed_projects as
select
  p.id,
  p.name,
  p.description,
  p.type,
  p.visibility,
  p.status,
  p.owner_id,
  p.cluster_id,
  p.repository_url,
  p.demo_url,
  p.created_at,
  p.updated_at,
  p.started_at,
  p.completed_at,
  owner.full_name as owner_name,
  owner_auth.email as owner_email,
  owner.avatar_url as owner_avatar,
  c.name as cluster_name,
  (
    select count(*)
    from project_members pm
    where pm.project_id = p.id and pm.status = 'approved'
  ) as members_count,
  (
    select array_agg(pt.tag)
    from project_tags pt
    where pt.project_id = p.id
  ) as tags
from projects p
left join profiles owner on p.owner_id = owner.id
left join auth.users owner_auth on p.owner_id = owner_auth.id
left join clusters c on p.cluster_id = c.id;

-- Create view for detailed project members with user info
create or replace view detailed_project_members as
select
  pm.id,
  pm.project_id,
  pm.user_id,
  pm.role,
  pm.status,
  pm.joined_at,
  pm.approved_at,
  pm.approved_by,
  pm.contribution_notes,
  u.full_name,
  u_auth.email,
  u.avatar_url,
  u.role as user_role,
  u.academic_level,
  approver.full_name as approved_by_name
from project_members pm
join profiles u on pm.user_id = u.id
left join auth.users u_auth on pm.user_id = u_auth.id
left join profiles approver on pm.approved_by = approver.id;

-- Create view for user's project summary
create or replace view user_projects_summary as
select
  u.id as user_id,
  count(distinct case when p.owner_id = u.id then p.id end) as owned_projects,
  count(distinct case when pm.user_id = u.id and pm.status = 'approved' then p.id end) as member_projects,
  count(distinct case when p.owner_id = u.id and p.status = 'active' then p.id end) as active_projects,
  count(distinct case when p.owner_id = u.id and p.status = 'completed' then p.id end) as completed_projects
from profiles u
left join projects p on p.owner_id = u.id
left join project_members pm on pm.user_id = u.id and pm.project_id = p.id
group by u.id;

-- Create view for cluster projects summary
create or replace view cluster_projects_summary as
select
  c.id as cluster_id,
  count(distinct p.id) as total_projects,
  count(distinct case when p.status = 'active' then p.id end) as active_projects,
  count(distinct case when p.status = 'completed' then p.id end) as completed_projects,
  array_agg(distinct pt.tag) filter (where pt.tag is not null) as popular_tags
from clusters c
left join projects p on p.cluster_id = c.id
left join project_tags pt on pt.project_id = p.id
group by c.id;

-- Grant select permissions on views
grant select on detailed_projects to authenticated;
grant select on detailed_project_members to authenticated;
grant select on user_projects_summary to authenticated;
grant select on cluster_projects_summary to authenticated;
