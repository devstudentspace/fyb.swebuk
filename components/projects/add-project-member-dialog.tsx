"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  academic_level: string;
}

interface AddProjectMemberDialogProps {
  projectId: string;
  projectType: string;
  onMemberAdded: () => void;
}

export function AddProjectMemberDialog({
  projectId,
  projectType,
  onMemberAdded,
}: AddProjectMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [memberRole, setMemberRole] = useState("member");

  useEffect(() => {
    if (open) {
      fetchAvailableUsers();
    }
  }, [open]);

  const fetchAvailableUsers = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Get current project members
      const { data: currentMembers } = await supabase
        .from("project_members")
        .select("user_id")
        .eq("project_id", projectId);

      const memberIds = currentMembers?.map((m) => m.user_id) || [];

      // Get all users who are not already members
      let query = supabase
        .from("public_profiles_with_email")
        .select("id, full_name, email, role, academic_level")
        .not("id", "in", `(${memberIds.join(",")})`);

      // For cluster projects, only show students and staff
      if (projectType === "cluster") {
        query = query.in("role", ["student", "staff"]);
      }

      const { data, error } = await query.order("full_name");

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();

      // Check if the user is already a member
      const { data: existingMember } = await supabase
        .from("project_members")
        .select("id, status")
        .eq("project_id", projectId)
        .eq("user_id", selectedUserId)
        .single();

      if (existingMember) {
        toast.error("This user is already a member or has a pending request");
        return;
      }

      // Add the member with approved status (admin action)
      const { error } = await supabase.from("project_members").insert({
        project_id: projectId,
        user_id: selectedUserId,
        role: memberRole,
        status: "approved",
        approved_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Member added successfully!");
      setOpen(false);
      setSelectedUserId("");
      setMemberRole("member");
      onMemberAdded();
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Project Member</DialogTitle>
          <DialogDescription>
            Directly add a user to this project. They will be added with approved
            status.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No available users found
                    </div>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({user.email})
                          </span>
                          {user.role === "staff" && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              Staff
                            </span>
                          )}
                          {user.academic_level && user.academic_level !== "student" && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                              Level {user.academic_level}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Member Role</Label>
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="maintainer">Maintainer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Maintainers have additional permissions to manage the project
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMember}
            disabled={saving || !selectedUserId || loading}
          >
            {saving ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
