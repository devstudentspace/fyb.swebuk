import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user role from metadata or custom claims
  const userRole = user.user_metadata?.role || "student";

  // Redirect to role-specific dashboard
  switch (userRole.toLowerCase()) {
    case "admin":
      redirect("/dashboard/admin");
    case "staff":
      redirect("/dashboard/staff");
    case "lead":
      redirect("/dashboard/lead");
    case "deputy":
      redirect("/dashboard/deputy");
    case "student":
    default:
      redirect("/dashboard/student");
  }
}