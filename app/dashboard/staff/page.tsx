import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StaffPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "staff") {
    return redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-4">Staff Dashboard</h2>
        <nav className="flex flex-col justify-between h-full">
          <ul>
            <li>
              <Link href="/dashboard/staff/clusters" className="block py-2">
                Manage Clusters
              </Link>
            </li>
            <li>
              <Link href="/dashboard/staff/users" className="block py-2 bg-gray-700 rounded">
                Manage Users
              </Link>
            </li>
            <li>
              <Link href="/dashboard/staff/settings" className="block py-2">
                System Settings
              </Link>
            </li>
          </ul>
          <Link
            href="/auth/logout"
            className="block py-2 mt-4 text-center bg-red-600 hover:bg-red-700 rounded"
          >
            Logout
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {profile.full_name}
        </h1>
        <p>This is your staff dashboard.</p>
      </main>
    </div>
  );
}
