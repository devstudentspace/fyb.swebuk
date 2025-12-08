"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getStudentFYP() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from("final_year_projects")
      .select(`
        *,
        supervisor:supervisor_id (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq("student_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching FYP:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching FYP:", error);
    return null;
  }
}

export async function submitFYPProposal(title: string, description: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify student level (double check on server side)
  const { data: profile } = await supabase
    .from("profiles")
    .select("academic_level")
    .eq("id", user.id)
    .single();

  if (profile?.academic_level !== "level_400" && profile?.academic_level !== "400") {
    return { success: false, error: "Only Level 400 students can submit FYP proposals." };
  }

  try {
    const { error } = await supabase.from("final_year_projects").insert({
      student_id: user.id,
      title,
      description,
      status: "proposal_submitted",
    });

    if (error) throw error;

    revalidatePath("/dashboard/student/fyp");
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting proposal:", error);
    return { success: false, error: error.message || "Failed to submit proposal" };
  }
}

export async function getFYPComments(fypId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("fyp_comments")
      .select(`
        *,
        user:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq("fyp_id", fypId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

export async function postFYPComment(fypId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const { error } = await supabase.from("fyp_comments").insert({
      fyp_id: fypId,
      user_id: user.id,
      content,
    });

    if (error) throw error;
    
    revalidatePath("/dashboard/student/fyp");
    return { success: true };
  } catch (error: any) {
    console.error("Error posting comment:", error);
    return { success: false, error: error.message };
  }
}
