import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UsersClientWrapper from "./users-client-wrapper";

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

  if (!profile || (profile.role !== "staff" && profile.role !== "admin")) {
    return redirect("/");
  }

  const { data: profiles } = await supabase.from("profiles").select("*");

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <div className="py-6 font-bold bg-blue-950 text-center">
          Manage Users
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
        <main>
          <UsersClientWrapper
            initialProfiles={profiles || []}
            currentUserRole={profile.role}
          />
        </main>
      </div>
    </div>
  );
}