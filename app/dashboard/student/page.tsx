import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StudentPage() {
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

  if (!profile || profile.role !== "student") {
    return redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>
        <nav className="flex flex-col justify-between h-full">
          <ul>
            <li>
              <Link href="/dashboard/student/projects" className="block py-2">
                My Projects
              </Link>
            </li>
            <li>
              <Link href="/dashboard/student/clusters" className="block py-2">
                My Clusters
              </Link>
            </li>
            <li>
              <Link href="/dashboard/student/blog" className="block py-2">
                My Blog Posts
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
        <p>This is your student dashboard.</p>
      </main>
    </div>
  );
}
