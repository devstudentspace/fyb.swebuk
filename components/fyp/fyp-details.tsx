"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, CheckCircle, Clock, FileText, AlertCircle } from "lucide-react";
import { FYPComments } from "./fyp-comments";
import { FYPFileUpload } from "./fyp-file-upload";

interface FYP {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  student_id: string;
  supervisor?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  proposal_url?: string;
  report_url?: string;
  grade?: string;
  feedback?: string;
}

interface FYPDetailsProps {
  fyp: FYP;
  comments: any[];
}

export function FYPDetails({ fyp, comments }: FYPDetailsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "proposal_submitted":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Proposal Submitted</Badge>;
      case "proposal_approved":
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Proposal Approved</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50"><Clock className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case "ready_for_review":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800"><FileText className="w-3 h-3 mr-1" /> Ready for Review</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "rejected":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{fyp.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Submitted on {new Date(fyp.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        {getStatusBadge(fyp.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
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

          {/* File Uploads - Only show if not completed or rejected */}
          {fyp.status !== "completed" && fyp.status !== "rejected" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FYPFileUpload
                  fypId={fyp.id}
                  studentId={fyp.student_id}
                  documentType="proposal"
                  currentFileUrl={fyp.proposal_url}
                />
                {(fyp.status === "in_progress" || fyp.status === "ready_for_review") && (
                  <FYPFileUpload
                    fypId={fyp.id}
                    studentId={fyp.student_id}
                    documentType="report"
                    currentFileUrl={fyp.report_url}
                  />
                )}
              </div>
            </div>
          )}

          <FYPComments fypId={fyp.id} initialComments={comments} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Supervisor</CardTitle>
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
                    <p className="text-xs text-muted-foreground">Project Supervisor</p>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fyp.proposal_url ? (
                <a
                  href={fyp.proposal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 border rounded-md text-sm hover:bg-muted/50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Proposal
                  </span>
                  <Badge variant="outline">View</Badge>
                </a>
              ) : (
                <div className="text-sm text-muted-foreground italic">No proposal document uploaded.</div>
              )}

              {fyp.report_url ? (
                <a
                  href={fyp.report_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 border rounded-md text-sm hover:bg-muted/50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    Final Report
                  </span>
                  <Badge variant="outline">View</Badge>
                </a>
              ) : (
                <div className="text-sm text-muted-foreground italic">No report uploaded yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
