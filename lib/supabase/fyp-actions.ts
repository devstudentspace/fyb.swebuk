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
        supervisor:profiles!supervisor_id (
          full_name,
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
        user:profiles!user_id (
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
    revalidatePath("/dashboard/staff/fyp");
    return { success: true };
  } catch (error: any) {
    console.error("Error posting comment:", error);
    return { success: false, error: error.message };
  }
}

export async function updateFYPStatus(fypId: string, status: string, feedback?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  // Verify user is staff or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "staff" && profile.role !== "admin")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updateData: any = { status };

    if (feedback !== undefined) {
      updateData.feedback = feedback;
    }

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("final_year_projects")
      .update(updateData)
      .eq("id", fypId);

    if (error) throw error;

    revalidatePath("/dashboard/staff/fyp");
    revalidatePath("/dashboard/student/fyp");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating FYP status:", error);
    return { success: false, error: error.message };
  }
}

export async function assignSupervisor(fypId: string, supervisorId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  // Verify user is staff or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "staff" && profile.role !== "admin")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { error } = await supabase
      .from("final_year_projects")
      .update({ supervisor_id: supervisorId })
      .eq("id", fypId);

    if (error) throw error;

    revalidatePath("/dashboard/staff/fyp");
    revalidatePath("/dashboard/student/fyp");
    return { success: true };
  } catch (error: any) {
    console.error("Error assigning supervisor:", error);
    return { success: false, error: error.message };
  }
}

export async function updateFYPGrade(fypId: string, grade: string, feedback?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  // Verify user is staff or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "staff" && profile.role !== "admin")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updateData: any = {
      grade,
      status: "completed",
      completed_at: new Date().toISOString(),
    };

    if (feedback) {
      updateData.feedback = feedback;
    }

    const { error } = await supabase
      .from("final_year_projects")
      .update(updateData)
      .eq("id", fypId);

    if (error) throw error;

    revalidatePath("/dashboard/staff/fyp");
    revalidatePath("/dashboard/student/fyp");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating grade:", error);
    return { success: false, error: error.message };
  }
}

export async function uploadFYPDocument(
  fypId: string,
  studentId: string,
  file: File,
  documentType: "proposal" | "report"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // Create file path: studentId/fypId/document_type_timestamp.pdf
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const filePath = `${studentId}/${fypId}/${documentType}_${timestamp}.${fileExt}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from("fyp-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("fyp-documents")
      .getPublicUrl(filePath);

    // Update FYP record with document URL
    const updateField = documentType === "proposal" ? "proposal_url" : "report_url";
    const { error: updateError } = await supabase
      .from("final_year_projects")
      .update({ [updateField]: publicUrl })
      .eq("id", fypId);

    if (updateError) throw updateError;

    revalidatePath("/dashboard/student/fyp");
    revalidatePath("/dashboard/staff/fyp");
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error("Error uploading document:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteFYPDocument(
  fypId: string,
  fileUrl: string,
  documentType: "proposal" | "report"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // Extract file path from URL
    const urlParts = fileUrl.split("/");
    const bucketIndex = urlParts.findIndex((part) => part === "fyp-documents");
    const filePath = urlParts.slice(bucketIndex + 1).join("/");

    // Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from("fyp-documents")
      .remove([filePath]);

    if (deleteError) throw deleteError;

    // Update FYP record to remove document URL
    const updateField = documentType === "proposal" ? "proposal_url" : "report_url";
    const { error: updateError } = await supabase
      .from("final_year_projects")
      .update({ [updateField]: null })
      .eq("id", fypId);

    if (updateError) throw updateError;

    revalidatePath("/dashboard/student/fyp");
    revalidatePath("/dashboard/staff/fyp");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return { success: false, error: error.message };
  }
}
