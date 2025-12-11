"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { SupervisorAssignment } from "./supervisor-assignment";

interface UnassignedProjectCardProps {
  fyp: {
    id: string;
    title: string;
    student: {
      full_name: string;
      avatar_url: string | null;
    } | null;
    created_at: string;
  };
  supervisors: Array<{
    id: string;
    full_name: string;
    email: string;
  }>;
}

export function UnassignedProjectCard({ fyp, supervisors }: UnassignedProjectCardProps) {
  const [isAssigning, setIsAssigning] = useState(false);

  return (
    <>
      <div className="p-4 bg-white dark:bg-gray-800 border rounded-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={fyp.student?.avatar_url || undefined} />
              <AvatarFallback>{fyp.student?.full_name?.charAt(0) || "S"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{fyp.title}</h4>
              <p className="text-sm text-muted-foreground">
                {fyp.student?.full_name} • {new Date(fyp.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setIsAssigning(true)} className="shrink-0">
            <UserPlus className="mr-2 h-4 w-4" />
            Assign
          </Button>
        </div>
      </div>

      <SupervisorAssignment
        fypId={fyp.id}
        studentName={fyp.student?.full_name || "Student"}
        projectTitle={fyp.title}
        supervisors={supervisors}
        open={isAssigning}
        onOpenChange={setIsAssigning}
      />
    </>
  );
}
