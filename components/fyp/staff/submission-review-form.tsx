"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { reviewFYPSubmission } from "@/lib/supabase/fyp-staff-actions";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SubmissionReviewFormProps {
  submissionId: string;
  submissionTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmissionReviewForm({
  submissionId,
  submissionTitle,
  open,
  onOpenChange,
}: SubmissionReviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"approved" | "needs_revision" | "rejected" | null>(null);

  async function handleReview(status: "approved" | "needs_revision" | "rejected") {
    if (!feedback.trim()) {
      toast.error("Please provide feedback");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await reviewFYPSubmission(submissionId, status, feedback);

      if (result.success) {
        toast.success(`Submission ${status === "approved" ? "approved" : status === "needs_revision" ? "marked for revision" : "rejected"} successfully`);
        onOpenChange(false);
        setFeedback("");
        setSelectedStatus(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to review submission");
      }
    } catch (error) {
      console.error("Error reviewing submission:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Review Submission</DialogTitle>
          <DialogDescription>{submissionTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">Supervisor Feedback *</Label>
            <Textarea
              id="feedback"
              placeholder="Provide detailed feedback for the student..."
              rows={6}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This feedback will be visible to the student
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setFeedback("");
              setSelectedStatus(null);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleReview("rejected")}
            disabled={isSubmitting || !feedback.trim()}
          >
            {isSubmitting && selectedStatus === "rejected" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleReview("needs_revision")}
            disabled={isSubmitting || !feedback.trim()}
            className="bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50"
          >
            {isSubmitting && selectedStatus === "needs_revision" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Needs Revision
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={() => handleReview("approved")}
            disabled={isSubmitting || !feedback.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting && selectedStatus === "approved" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
