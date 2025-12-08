import { createClient } from "@/lib/supabase/server";

export async function getStudentDashboardStats(userId: string) {
  const supabase = await createClient();

  try {
    // Get user's clusters count
    const { count: clustersCount } = await supabase
      .from("cluster_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "approved");

    // Get user's active projects count (owned + member of)
    const { count: ownedProjectsCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", userId)
      .eq("status", "active");

    const { count: memberProjectsCount } = await supabase
      .from("project_members")
      .select("project:projects!inner(*)", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "approved")
      .eq("project.status", "active");

    const activeProjects = (ownedProjectsCount || 0) + (memberProjectsCount || 0);

    // Get upcoming events (placeholder for now - will be implemented in event system)
    const upcomingEvents = 0;

    // Get total project contributions (total projects user is part of)
    const { count: totalContributions } = await supabase
      .from("project_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "approved");

    return {
      myClubs: clustersCount || 0,
      activeProjects,
      upcomingEvents,
      contributions: totalContributions || 0,
    };
  } catch (error) {
    console.error("Error fetching student dashboard stats:", error);
    return {
      myClubs: 0,
      activeProjects: 0,
      upcomingEvents: 0,
      contributions: 0,
    };
  }
}

export async function getRecentProjects(userId: string, limit: number = 3) {
  const supabase = await createClient();

  try {
    // Get projects user owns or is a member of
    const { data: ownedProjects, error: ownedError } = await supabase
      .from("detailed_projects")
      .select("*")
      .eq("owner_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (ownedError) throw ownedError;

    // If we need more projects, get ones they're members of
    const remainingLimit = limit - (ownedProjects?.length || 0);
    let memberProjects: any[] = [];

    if (remainingLimit > 0) {
      const { data: memberData, error: memberError } = await supabase
        .from("project_members")
        .select("project:projects!inner(*)")
        .eq("user_id", userId)
        .eq("status", "approved")
        .eq("project.status", "active")
        .order("joined_at", { ascending: false })
        .limit(remainingLimit);

      if (!memberError && memberData) {
        memberProjects = memberData.map((item: any) => item.project);
      }
    }

    const allProjects = [...(ownedProjects || []), ...memberProjects];

    return allProjects.map((project) => ({
      id: project.id,
      title: project.name,
      description: project.description,
      tags: project.tags?.slice(0, 3) || [],
      type: project.type,
      cluster_name: project.cluster_name,
    }));
  } catch (error) {
    console.error("Error fetching recent projects:", error);
    return [];
  }
}

export async function getPopularClusters(limit: number = 4) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("detailed_clusters")
      .select("*")
      .eq("status", "active")
      .order("members_count", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching popular clusters:", error);
    return [];
  }
}
