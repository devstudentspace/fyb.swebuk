import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadDashboard } from "@/components/dashboard/lead-dashboard";

export default async function LeadDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const userRole = user.user_metadata?.role || "student";

  // Redirect if user is not a lead
  if (userRole.toLowerCase() !== "lead") {
    redirect(`/dashboard/${userRole.toLowerCase()}`);
  }

  return (
    <LeadDashboard user={user} />
  );
}