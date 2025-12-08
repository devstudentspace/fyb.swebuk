import { createClient } from "@/lib/supabase/server";
import { getStudentFYP, getFYPComments } from "@/lib/supabase/fyp-actions";
import { SubmitProposalForm } from "@/components/fyp/submit-proposal-form";
import { FYPDetails } from "@/components/fyp/fyp-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { redirect } from "next/navigation";

export default async function StudentFYPPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check user academic level
  const { data: profile } = await supabase
    .from("profiles")
    .select("academic_level")
    .eq("id", user.id)
    .single();

  // Only exact 'level_400' can access FYP module as per utils
  // But seeding used just '400'. Let's check both to be safe, or update the utils/seed.
  // The utils say 'level_400'. The seed data says '400' in some places and 'level_400' in others?
  // Looking at seed.sql: `academic_level: '400'` for seeded users.
  // Looking at `handle_new_user` trigger: it defaults to 'student'.
  // Looking at `processAcademicSessionEnd`: it sets `level_400`.
  // I should probably normalize this. For now, I'll accept both '400' and 'level_400'.
  const level = profile?.academic_level;
  const isEligible = level === "level_400" || level === "400";

  if (!isEligible) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="p-4 rounded-full bg-muted">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md">
          The Final Year Project module is only available to Level 400 students.
          You are currently recorded as: <span className="font-medium text-foreground">{level || "Student"}</span>.
        </p>
      </div>
    );
  }

  const fyp = await getStudentFYP();

  if (!fyp) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Final Year Project</h1>
          <p className="text-muted-foreground">
            Submit your project proposal for approval to begin your final year project.
          </p>
        </div>
        <SubmitProposalForm />
      </div>
    );
  }

  // Fetch comments if FYP exists
  const comments = await getFYPComments(fyp.id);

  return (
    <FYPDetails fyp={fyp} comments={comments} />
  );
}
