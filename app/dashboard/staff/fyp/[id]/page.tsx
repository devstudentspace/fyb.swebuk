import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FYPComments } from "@/components/fyp/fyp-comments";
import { StaffFYPActions } from "@/components/fyp/staff-fyp-actions";
import { Calendar, User, FileText, Clock } from "lucide-react";

async function getFYPDetails(fypId: string) {
  const supabase = await createClient();

  const { data, error} = await supabase
    .from("final_year_projects")
    .select(`
      *,
      student:profiles!student_id (
        id,
        full_name,
        avatar_url,
        academic_level
      ),
      supervisor:profiles!supervisor_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("id", fypId)
    .single();

  if (error) {
    console.error("Error fetching FYP:", error);
    return null;
  }

  return data;
}

async function getFYPComments(fypId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fyp_comments")
    .select(`
      *,
      user:profiles!user_id (
        full_name,
        avatar_url,
        role
      )
    `)
    .eq("fyp_id", fypId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return data || [];
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: any; label: string; className: string }> = {
    proposal_submitted: {
      variant: "secondary",
      label: "Proposal Submitted",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    },
    proposal_approved: {
      variant: "default",
      label: "Approved",
      className: "bg-green-100 text-green-800 hover:bg-green-100"
    },
    in_progress: {
      variant: "outline",
      label: "In Progress",
      className: "border-blue-200 text-blue-700 bg-blue-50"
    },
    ready_for_review: {
      variant: "secondary",
      label: "Ready for Review",
      className: "bg-purple-100 text-purple-800 hover:bg-purple-100"
    },
    completed: {
      variant: "default",
      label: "Completed",
      className: "bg-green-600 text-white hover:bg-green-600"
    },
    rejected: {
      variant: "destructive",
      label: "Rejected",
      className: ""
    },
  };

  const config = statusConfig[status] || { variant: "outline", label: status, className: "" };

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

export default async function StaffFYPDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "staff" && profile.role !== "admin")) {
    redirect("/dashboard");
  }

  const fyp = await getFYPDetails(params.id);

  if (!fyp) {
    notFound();
  }

  const comments = await getFYPComments(params.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{fyp.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Submitted {new Date(fyp.created_at).toLocaleDateString()}</span>
            </div>
            {fyp.completed_at && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Completed {new Date(fyp.completed_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        {getStatusBadge(fyp.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {fyp.description}
              </p>
            </CardContent>
          </Card>

          {/* Feedback */}
          {fyp.feedback && (
            <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10 dark:border-yellow-900">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-600" />
                  Supervisor Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{fyp.feedback}</p>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <FYPComments fypId={fyp.id} initialComments={comments} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Student</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={fyp.student?.avatar_url || undefined} />
                  <AvatarFallback>{fyp.student?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{fyp.student?.full_name}</p>
                  <Badge variant="outline" className="mt-1">
                    Level {fyp.student?.academic_level || "400"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supervisor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Supervisor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fyp.supervisor ? (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={fyp.supervisor.avatar_url || undefined} />
                    <AvatarFallback>{fyp.supervisor.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{fyp.supervisor.full_name}</p>
                    <p className="text-xs text-muted-foreground">{fyp.supervisor.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground">
                  <User className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">No supervisor assigned yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fyp.proposal_url ? (
                <div className="flex items-center justify-between p-2 border rounded-md text-sm">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Proposal
                  </span>
                  <Badge variant="outline">Uploaded</Badge>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">No proposal document uploaded.</div>
              )}

              {fyp.report_url && (
                <div className="flex items-center justify-between p-2 border rounded-md text-sm">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    Final Report
                  </span>
                  <Badge variant="outline">Uploaded</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grade */}
          {fyp.grade && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">{fyp.grade}</div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <StaffFYPActions fyp={fyp} currentUserId={user.id} />
        </div>
      </div>
    </div>
  );
}
