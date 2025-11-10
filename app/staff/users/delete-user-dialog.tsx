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
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface DeleteUserDialogProps {
  user: UserProfile;
  onDelete: () => void;
  currentUserRole?: string;
}

export function DeleteUserDialog({ user, onDelete, currentUserRole }: DeleteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteUser = async () => {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      // Delete profile record
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Delete user from auth (this requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

      if (authError) {
        console.warn("Could not delete auth user (may require admin service role):", authError);
      }

      setIsDialogOpen(false);
      onDelete();
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="h-8">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">{user.full_name || "N/A"}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">Role: {user.role}</p>
            {currentUserRole === "admin" && user.role === "admin" && (
              <p className="text-xs text-orange-600 mt-2">
                ⚠️ You are deleting another admin user
              </p>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteUser}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}