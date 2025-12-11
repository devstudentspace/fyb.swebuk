"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { assignSupervisorToFYP } from "@/lib/supabase/fyp-admin-actions";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SupervisorAssignmentProps {
  fypId: string;
  studentName: string;
  projectTitle: string;
  supervisors: Array<{
    id: string;
    full_name: string;
    email: string;
  }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupervisorAssignment({
  fypId,
  studentName,
  projectTitle,
  supervisors,
  open,
  onOpenChange,
}: SupervisorAssignmentProps) {
  const router = useRouter();
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>("");

  async function handleAssign() {
    if (!selectedSupervisor) {
      toast.error("Please select a supervisor");
      return;
    }

    setIsAssigning(true);
    try {
      const result = await assignSupervisorToFYP(fypId, selectedSupervisor);

      if (result.success) {
        toast.success("Supervisor assigned successfully");
        onOpenChange(false);
        setSelectedSupervisor("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to assign supervisor");
      }
    } catch (error) {
      console.error("Error assigning supervisor:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsAssigning(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Supervisor</DialogTitle>
          <DialogDescription>
            Assign a supervisor to {studentName}'s project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Project</Label>
            <p className="text-sm text-muted-foreground">{projectTitle}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supervisor">Select Supervisor *</Label>
            <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a supervisor" />
              </SelectTrigger>
              <SelectContent>
                {supervisors.map((supervisor) => (
                  <SelectItem key={supervisor.id} value={supervisor.id}>
                    {supervisor.full_name} - {supervisor.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedSupervisor("");
            }}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleAssign} disabled={isAssigning || !selectedSupervisor}>
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Supervisor
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
