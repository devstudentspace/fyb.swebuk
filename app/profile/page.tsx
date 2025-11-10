import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UpdateProfileForm from "@/components/update-profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <div>User profile not found.</div>;
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <div className="py-6 font-bold bg-purple-950 text-center">
          Manage Your Profile
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit Profile</CardTitle>
              <CardDescription>
                Update your profile information below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpdateProfileForm user={user} profile={profile} />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
