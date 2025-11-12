"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { StaffTable } from "./staff-table";
// We won't add a create dialog, as staff are created via the main user page.

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  email_confirmed_at: string | null;
}

interface StaffClientWrapperProps {
  initialProfiles: UserProfile[];
  currentUserRole: string;
}

export default function StaffClientWrapper({
  initialProfiles,
  currentUserRole
}: StaffClientWrapperProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>(initialProfiles);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refresh profiles when refreshTrigger changes
  useEffect(() => {
    const fetchProfiles = async () => {
      const supabase = createClient();
      const { data: newProfiles } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "staff");
      if (newProfiles) {
        setProfiles(newProfiles);
      }
    };

    fetchProfiles();
  }, [refreshTrigger]);

  const handleUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-4xl">Staff Members</h2>
        {/* Optionally, a button to create staff could be added here,
            but for now we assume they are created from the main user management page. */}
      </div>
      <StaffTable
        profiles={profiles}
        currentUserRole={currentUserRole}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
