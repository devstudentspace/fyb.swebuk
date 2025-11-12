import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminUsersClientWrapper from "./admin-users-client-wrapper";

export default async function UsersPage() {
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
    return redirect("/");
  }

  const { data: profiles } = await supabase.from("profiles").select("*");

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="flex-1 flex flex-col gap-6 w-full max-w-6xl px-3 py-6">
        <main>
          <AdminUsersClientWrapper
            initialProfiles={profiles || []}
            currentUserRole={profile.role}
          />
        </main>
      </div>
    </div>
  );
}