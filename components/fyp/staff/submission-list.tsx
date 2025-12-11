"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { SubmissionReviewForm } from "./submission-review-form";

interface Submission {
  id: string;
  submission_type: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  status: "pending" | "approved" | "needs_revision" | "rejected";
  supervisor_feedback: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

interface SubmissionListProps {
  submissions: Submission[];
}

const submissionTypeLabels: Record<string, string> = {
  proposal: "Project Proposal",
  progress_report: "Progress Report",
  chapter_draft: "Chapter Draft",
  final_thesis: "Final Thesis",
};

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          Pending Review
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Approved
        </Badge>
      );
    case "needs_revision":
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
          Needs Revision
        </Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function SubmissionList({ submissions }: SubmissionListProps) {
  const [reviewingSubmission, setReviewingSubmission] = useState<{ id: string; title: string } | null>(null);

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No submissions yet</p>
            <p className="text-sm mt-1">Student submissions will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <h4 className="font-semibold truncate">{submission.title}</h4>
                      {getStatusBadge(submission.status)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(submission.submitted_at), "MMM d, yyyy")}
                      </span>
                      <span className="text-xs px-2 py-1 bg-muted rounded">
                        {submissionTypeLabels[submission.submission_type] || submission.submission_type}
                      </span>
                    </div>

                    {submission.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {submission.description}
                      </p>
                    )}

                    {submission.supervisor_feedback && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900 rounded text-sm">
                        <p className="font-medium text-yellow-900 dark:text-yellow-300 mb-1">Your Feedback:</p>
                        <p className="text-yellow-800 dark:text-yellow-400 line-clamp-2">
                          {submission.supervisor_feedback}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {submission.file_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={submission.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    )}
                    {submission.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          setReviewingSubmission({
                            id: submission.id,
                            title: submission.title,
                          })
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {reviewingSubmission && (
        <SubmissionReviewForm
          submissionId={reviewingSubmission.id}
          submissionTitle={reviewingSubmission.title}
          open={!!reviewingSubmission}
          onOpenChange={(open) => {
            if (!open) setReviewingSubmission(null);
          }}
        />
      )}
    </>
  );
}
