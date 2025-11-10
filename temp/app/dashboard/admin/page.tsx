import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const userRole = user.user_metadata?.role || "student";

  // Redirect if user is not admin
  if (userRole.toLowerCase() !== "admin") {
    redirect(`/dashboard/${userRole.toLowerCase()}`);
  }

  return (
    <AdminDashboard user={user} />
  );
}