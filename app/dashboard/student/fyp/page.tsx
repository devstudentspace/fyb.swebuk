import { createClient } from "@/lib/supabase/server";
import { getStudentFYPWithSubmissions } from "@/lib/supabase/fyp-student-actions";
import { getFYPComments } from "@/lib/supabase/fyp-actions";
import { ProposalSubmission } from "@/components/fyp/proposal-submission";
import { SubmissionForm } from "@/components/fyp/student/submission-form";
import { SubmissionHistory } from "@/components/fyp/student/submission-history";
import { ProjectOverview } from "@/components/fyp/student/project-overview";
import { FYPComments } from "@/components/fyp/fyp-comments";
import { ChapterProgressTracker } from "@/components/fyp/chapter-progress-tracker";
import { Lock, MessageSquare, User, Clock, AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StudentFYPPage() {
  const supabase = await createClient();
  const { data: { user } } = await (supabase.auth as any).getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check user academic level
  const { data: profile } = await supabase
    .from("profiles")
    .select("academic_level, full_name")
    .eq("id", user.id)
    .single();

  const level = profile?.academic_level;
  const isEligible = level === "level_400" || level === "400";

  if (!isEligible) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="p-4 rounded-full bg-muted">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md">
          The Final Year Project module is only available to Level 400 students.
          You are currently recorded as: <span className="font-medium text-foreground">{level || "Student"}</span>.
        </p>
      </div>
    );
  }

  const fypData = await getStudentFYPWithSubmissions();

  // Check if student has been assigned a supervisor
  const hasSupervisor = fypData?.supervisor_id || fypData?.supervisor;

  // No FYP exists yet - check if student has a supervisor assigned
  if (!fypData) {
    // First check if there's a rejected FYP (for resubmission)
    const { data: rejectedFyp } = await supabase
      .from("final_year_projects")
      .select("id, title, description, feedback, supervisor_id")
      .eq("student_id", user.id)
      .eq("status", "rejected")
      .single();

    if (rejectedFyp) {
      // Has rejected proposal - can resubmit if they have a supervisor
      if (rejectedFyp.supervisor_id) {
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Final Year Project</h1>
              <p className="text-muted-foreground">
                Your proposal was not approved. Please review the feedback and resubmit.
              </p>
            </div>
            <ProposalSubmission
              proposalStatus="rejected"
              existingTitle={rejectedFyp.title || ""}
              existingDescription={rejectedFyp.description || ""}
              existingFeedback={rejectedFyp.feedback || ""}
            />
          </div>
        );
      } else {
        // Rejected but no supervisor
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Final Year Project</h1>
              <p className="text-muted-foreground">
                Your proposal was not approved and you don't have a supervisor assigned yet.
              </p>
            </div>
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <User className="h-5 w-5" />
                  Awaiting Supervisor Assignment
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Your rejected proposal is on file. Please contact the department administrator
                  to be assigned a supervisor so you can resubmit your proposal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-blue-100/50 dark:bg-blue-900/40 rounded-lg">
                  <div className="bg-blue-200 dark:bg-blue-800 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Supervisor</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">Not assigned yet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }
    }

    // No FYP exists - check if student has a supervisor assigned (via clusters or direct assignment)
    if (!hasSupervisor) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Final Year Project</h1>
            <p className="text-muted-foreground">
              Complete the Final Year Project module requirements.
            </p>
          </div>

          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <User className="h-5 w-5" />
                Awaiting Supervisor Assignment
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                You need to be assigned a supervisor before you can submit your FYP proposal.
                Please contact the department administrator or your cluster lead.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-100/50 dark:bg-blue-900/40 rounded-lg">
                  <div className="bg-blue-200 dark:bg-blue-800 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Status</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">Waiting for supervisor assignment</p>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium mb-2">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>An administrator will assign you to a supervisor</li>
                    <li>Once assigned, you can submit your project proposal</li>
                    <li>Your supervisor will review and approve your proposal</li>
                    <li>After approval, you can start working on your FYP chapters</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Has supervisor - can submit proposal
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Final Year Project</h1>
          <p className="text-muted-foreground">
            You have been assigned a supervisor. Submit your project proposal to begin your FYP journey.
          </p>
        </div>

        <ProposalSubmission proposalStatus="none" />
      </div>
    );
  }

  // FYP exists - check proposal status
  const proposalStatus = fypData.status;

  // Proposal pending or rejected - show proposal status card
  if (proposalStatus === "proposal_submitted" || proposalStatus === "rejected") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Final Year Project</h1>
          <p className="text-muted-foreground">
            {proposalStatus === "rejected"
              ? "Your proposal was not approved. Please review the feedback and resubmit."
              : "Your proposal is under review."}
          </p>
        </div>

        <ProposalSubmission
          proposalStatus={proposalStatus === "proposal_submitted" ? "pending" : "rejected"}
          existingTitle={fypData.title || ""}
          existingDescription={fypData.description || ""}
          existingFeedback={fypData.feedback || ""}
          supervisorName={fypData.supervisor?.full_name}
        />
      </div>
    );
  }

  // Proposal approved - show full FYP dashboard
  if (proposalStatus === "proposal_approved" || proposalStatus === "in_progress") {
    // Fetch comments
    const comments = await getFYPComments(fypData.id);

    // Build chapter progress data
    const chapterTypes = [
      { type: 'proposal', label: 'Project Proposal' },
      { type: 'chapter_1', label: 'Chapter 1' },
      { type: 'chapter_2', label: 'Chapter 2' },
      { type: 'chapter_3', label: 'Chapter 3' },
      { type: 'chapter_4', label: 'Chapter 4' },
      { type: 'chapter_5', label: 'Chapter 5' },
      { type: 'final_thesis', label: 'Final Thesis' },
    ];

    const chapterProgress = chapterTypes.map(chapter => {
      const submissions = (fypData.submissions || []).filter(
        s => s.submission_type === chapter.type && s.is_latest_version
      );
      const latest = submissions[0];

      return {
        type: chapter.type,
        label: chapter.label,
        status: (!latest
          ? 'not_started'
          : latest.status === 'approved'
            ? 'approved'
            : latest.status === 'pending'
              ? 'pending'
              : 'needs_revision') as "approved" | "pending" | "needs_revision" | "not_started",
        latestVersion: latest?.version_number,
      };
    });

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-3 items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight">FYP Management (Level 400)</h1>
            <p className="text-muted-foreground">
              Project: {fypData.title}
              {fypData.supervisor && ` | Supervisor: ${fypData.supervisor.full_name}`}
            </p>
          </div>
          {fypData.supervisor && (
            <Button variant="default">
              <MessageSquare className="mr-2 h-4 w-4" />
              Project Chatroom
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submission Form */}
            <SubmissionForm fypId={fypData.id} />

            {/* Submission History */}
            <SubmissionHistory submissions={fypData.submissions || []} />

            {/* Comments Section */}
            <FYPComments fypId={fypData.id} initialComments={comments} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <ChapterProgressTracker
              chapters={chapterProgress}
              progressPercentage={fypData.progress_percentage || 0}
              githubRepoUrl={fypData.github_repo_url}
              fypId={fypData.id}
            />
            <ProjectOverview fyp={fypData} submissions={fypData.submissions || []} />
          </div>
        </div>
      </div>
    );
  }

  // Handle other statuses (completed, ready_for_review, etc.)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Final Year Project</h1>
        <p className="text-muted-foreground">
          Status: {proposalStatus}
        </p>
      </div>
      {/* For other statuses, show the full dashboard */}
      <ProposalSubmission
        proposalStatus="approved"
        existingTitle={fypData.title || ""}
        supervisorName={fypData.supervisor?.full_name}
      />
    </div>
  );
}
