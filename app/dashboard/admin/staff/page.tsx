import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StaffClientWrapper from "./staff-client-wrapper";

export default async function StaffManagementPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    // Only admins can manage staff
    return redirect("/");
  }

  // Fetch all profiles that have the 'staff' role
  const { data: staffProfiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "staff");

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <div className="py-6 font-bold bg-purple-950 text-center">
          Manage Staff
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
        <main>
          <StaffClientWrapper
            initialProfiles={staffProfiles || []}
            currentUserRole={profile.role}
          />
        </main>
      </div>
    </div>
  );
}
