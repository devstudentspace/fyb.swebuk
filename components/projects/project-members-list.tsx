"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { UserMinus, Crown, Shield, User as UserIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectMember {
  id: string;
  user_id: string;
  role: string;
  status: string;
  full_name: string;
  email: string;
  avatar_url: string;
  user_role: string;
  academic_level: string;
  contribution_notes: string;
  joined_at: string;
}

interface ProjectMembersListProps {
  projectId: string;
  canManage: boolean;
  currentUserId: string;
}

export function ProjectMembersList({
  projectId,
  canManage,
  currentUserId,
}: ProjectMembersListProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("detailed_project_members")
        .select("*")
        .eq("project_id", projectId)
        .eq("status", "approved")
        .order("role", { ascending: true })
        .order("joined_at", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load project members");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMemberId) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("id", removingMemberId);

      if (error) throw error;

      toast.success("Member removed successfully");
      fetchMembers();
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member: " + error.message);
    } finally {
      setShowRemoveDialog(false);
      setRemovingMemberId(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-amber-600" />;
      case "maintainer":
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "maintainer":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No members yet</h3>
          <p className="text-muted-foreground mt-2">
            This project doesn't have any members yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback>
                      {member.full_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{member.full_name}</h4>
                      {getRoleIcon(member.role)}
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {member.user_role}
                      </Badge>
                      {member.academic_level && (
                        <Badge variant="outline" className="text-xs">
                          Level {member.academic_level}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </span>
                    </div>
                    {member.contribution_notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        {member.contribution_notes}
                      </p>
                    )}
                  </div>
                </div>
                {canManage && member.role !== "owner" && member.user_id !== currentUserId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRemovingMemberId(member.id);
                      setShowRemoveDialog(true);
                    }}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemovingMemberId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
