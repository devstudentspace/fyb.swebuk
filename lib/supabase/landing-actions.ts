"use server";

import { createClient } from "@/lib/supabase/server";
import type { DetailedBlog } from "@/lib/constants/blog";
import type { DetailedEvent } from "@/lib/constants/events";

// ============================================
// LANDING PAGE DATA FETCHING
// ============================================

// Fetch featured blogs
export async function getFeaturedBlogs(limit = 3) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("detailed_blogs")
      .select("*")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured blogs:", error);
      return [];
    }

    return (data as DetailedBlog[]) || [];
  } catch (error) {
    console.error("Unexpected error fetching featured blogs:", error);
    return [];
  }
}

// Fetch latest blogs
export async function getLatestBlogs(limit = 4) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("detailed_blogs")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching latest blogs:", error);
      return [];
    }

    return (data as DetailedBlog[]) || [];
  } catch (error) {
    console.error("Unexpected error fetching latest blogs:", error);
    return [];
  }
}

// Fetch upcoming events
export async function getUpcomingEvents(limit = 3) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("detailed_events")
      .select("*")
      .eq("status", "published")
      .eq("is_public", true)
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching upcoming events:", error);
      return [];
    }

    return (data as DetailedEvent[]) || [];
  } catch (error) {
    console.error("Unexpected error fetching upcoming events:", error);
    return [];
  }
}

// Fetch popular clusters (those with the most members)
export async function getPopularClusters(limit = 4) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("detailed_clusters")
      .select("*")
      .eq("status", "active")
      .order("members_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching popular clusters:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching popular clusters:", error);
    return [];
  }
}