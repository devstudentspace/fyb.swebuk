"use client";

import { useState } from "react";
import { submitFYPProposal } from "@/lib/supabase/fyp-actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send } from "lucide-react";

export function SubmitProposalForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await submitFYPProposal(title, description);
      if (result.success) {
        toast.success("FYP Proposal submitted successfully!");
      } else {
        toast.error(result.error || "Failed to submit proposal.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Final Year Project Proposal</CardTitle>
        <CardDescription>
          Please provide a clear title and description for your proposed project. 
          This will be reviewed by the academic staff.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input 
              id="title" 
              placeholder="e.g., AI-Powered Traffic Management System" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe the problem, proposed solution, and key technologies..." 
              className="min-h-[150px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={50}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Submitting..." : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Proposal
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
