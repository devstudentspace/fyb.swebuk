"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

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

interface SubmissionHistoryProps {
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
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    case "needs_revision":
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          Needs Revision
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function SubmissionHistory({ submissions }: SubmissionHistoryProps) {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No submissions yet</p>
            <p className="text-sm mt-1">Your submissions will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Document</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Submitted</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {submissions.map((submission) => (
                <tr key={submission.id} className="text-sm">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{submission.title}</p>
                        {submission.file_name && (
                          <p className="text-xs text-muted-foreground truncate">
                            {submission.file_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-muted-foreground">
                      {submissionTypeLabels[submission.submission_type] || submission.submission_type}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(submission.submitted_at), "MMM d, yyyy")}
                    </div>
                  </td>
                  <td className="py-4">{getStatusBadge(submission.status)}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      {submission.file_url && (
                        <a
                          href={submission.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs font-medium"
                        >
                          Download
                        </a>
                      )}
                      {submission.supervisor_feedback && (
                        <button
                          onClick={() => {
                            // Show feedback in a modal or expand inline
                            alert(submission.supervisor_feedback);
                          }}
                          className="text-primary hover:underline text-xs font-medium"
                        >
                          View Feedback
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
