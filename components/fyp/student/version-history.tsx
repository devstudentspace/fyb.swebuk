"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Download, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface SubmissionVersion {
  id: string;
  title: string;
  version_number: number;
  submitted_at: string;
  status: string;
  supervisor_feedback: string | null;
  reviewed_at: string | null;
  file_url: string | null;
  file_name: string | null;
  is_latest_version: boolean;
}

interface VersionHistoryProps {
  submissions: SubmissionVersion[];
  submissionType: string;
}

function getStatusInfo(status: string) {
  const statusMap: Record<string, { label: string; variant: any; icon: any; color: string }> = {
    pending: {
      label: "Pending Review",
      variant: "secondary",
      icon: Clock,
      color: "text-yellow-600",
    },
    approved: {
      label: "Approved",
      variant: "default",
      icon: CheckCircle,
      color: "text-green-600",
    },
    needs_revision: {
      label: "Needs Revision",
      variant: "destructive",
      icon: AlertCircle,
      color: "text-orange-600",
    },
    rejected: {
      label: "Rejected",
      variant: "destructive",
      icon: XCircle,
      color: "text-red-600",
    },
  };

  return statusMap[status] || statusMap.pending;
}

function formatSubmissionType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function VersionHistory({ submissions, submissionType }: VersionHistoryProps) {
  if (submissions.length === 0) {
    return null;
  }

  const sortedSubmissions = [...submissions].sort((a, b) => b.version_number - a.version_number);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Version History - {formatSubmissionType(submissionType)}
        </CardTitle>
        <CardDescription>
          Track all versions and revisions of this submission
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSubmissions.map((submission) => {
            const statusInfo = getStatusInfo(submission.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={submission.id}
                className={`p-4 border rounded-lg ${
                  submission.is_latest_version ? 'border-primary bg-primary/5' : 'border-muted'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono">
                        v{submission.version_number}
                      </Badge>
                      {submission.is_latest_version && (
                        <Badge variant="default" className="bg-primary">
                          Latest
                        </Badge>
                      )}
                      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <div>
                      <p className="font-medium">{submission.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                      </p>
                    </div>

                    {submission.supervisor_feedback && (
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">Supervisor Feedback:</p>
                        <p className="text-sm text-muted-foreground">{submission.supervisor_feedback}</p>
                        {submission.reviewed_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reviewed {formatDistanceToNow(new Date(submission.reviewed_at), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {submission.file_url && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={submission.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
