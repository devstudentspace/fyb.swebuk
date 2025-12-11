"use client";

import { useState } from "react";
import { submitFYPProposal } from "@/lib/supabase/fyp-actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Upload } from "lucide-react";

export function SubmitProposalForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;

    try {
      const formData = new FormData(form);
      const result = await submitFYPProposal(formData);

      if (result.success) {
        toast.success("FYP Proposal submitted successfully!");
        form.reset();
        setTitle("");
        setDescription("");
        setSelectedFile(null);
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
              name="title"
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
              name="description"
              placeholder="Describe the problem, proposed solution, and key technologies..."
              className="min-h-[150px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Proposal Document (Optional)</Label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer group relative">
              <input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-primary/10 rounded-full p-3 mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                {selectedFile ? (
                  <>
                    <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF or DOCX (Max 25MB)
                    </p>
                  </>
                )}
              </div>
            </div>
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
