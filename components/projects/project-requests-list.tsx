"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Check, X, UserPlus } from "lucide-react";

interface ProjectRequest {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  user_role: string;
  academic_level: string;
  joined_at: string;
}

interface ProjectRequestsListProps {
  projectId: string;
  canManage: boolean;
  currentUserId: string;
}

export function ProjectRequestsList({
  projectId,
  canManage,
  currentUserId,
}: ProjectRequestsListProps) {
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [projectId]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("detailed_project_members")
        .select("*")
        .eq("project_id", projectId)
        .eq("status", "pending")
        .order("joined_at", { ascending: true });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load join requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("project_members")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: currentUserId,
        })
        .eq("id", requestId);

      if (error) throw error;

      toast.success("Request approved successfully");
      fetchRequests();
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request: " + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("project_members")
        .update({
          status: "rejected",
          approved_by: currentUserId,
        })
        .eq("id", requestId);

      if (error) throw error;

      toast.success("Request rejected");
      fetchRequests();
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request: " + error.message);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
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

  if (!canManage) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Access Restricted</h3>
          <p className="text-muted-foreground mt-2">
            Only project owners can view and manage join requests
          </p>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No pending requests</h3>
          <p className="text-muted-foreground mt-2">
            There are no join requests waiting for approval
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.avatar_url} />
                  <AvatarFallback>
                    {request.full_name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{request.full_name}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {request.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {request.user_role}
                    </Badge>
                    {request.academic_level && (
                      <Badge variant="outline" className="text-xs">
                        Level {request.academic_level}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Requested {new Date(request.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  disabled={processing === request.id}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(request.id)}
                  disabled={processing === request.id}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
