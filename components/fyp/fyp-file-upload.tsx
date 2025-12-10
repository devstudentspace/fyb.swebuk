"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { uploadFYPDocument, deleteFYPDocument } from "@/lib/supabase/fyp-actions";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FYPFileUploadProps {
  fypId: string;
  documentType: "proposal" | "report";
  currentFileUrl?: string | null;
  studentId: string;
}

export function FYPFileUpload({ fypId, documentType, currentFileUrl, studentId }: FYPFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadFYPDocument(fypId, studentId, file, documentType);
      if (result.success) {
        toast.success(`${documentType === "proposal" ? "Proposal" : "Report"} uploaded successfully`);
        window.location.reload();
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!currentFileUrl) return;

    setDeleting(true);
    try {
      const result = await deleteFYPDocument(fypId, currentFileUrl, documentType);
      if (result.success) {
        toast.success("Document deleted successfully");
        window.location.reload();
      } else {
        toast.error(result.error || "Delete failed");
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
    } finally {
      setDeleting(false);
    }
  };

  const getFileName = (url: string) => {
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {documentType === "proposal" ? "Project Proposal" : "Final Report"}
            </Label>
            {currentFileUrl && (
              <Badge variant="outline" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Uploaded
              </Badge>
            )}
          </div>

          {currentFileUrl ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm truncate">{getFileName(currentFileUrl)}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                  >
                    <a
                      href={currentFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Document</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this document? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={deleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                To replace this document, upload a new file below
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No document uploaded yet
            </div>
          )}

          <div className="space-y-2">
            <Input
              id={`file-${documentType}`}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              PDF only, max 10MB
            </p>
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Uploading...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
