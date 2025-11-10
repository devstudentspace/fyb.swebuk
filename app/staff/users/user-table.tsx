"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteUser, updateUserProfile, viewUser } from "@/lib/supabase/admin-actions";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  email_confirmed_at: string | null;
}

interface FullUserDetails {
  profile: UserProfile | null;
  auth: any; // Supabase auth user object
}

interface UserTableProps {
  profiles: UserProfile[];
  currentUserRole: string;
  onUpdate: () => void;
}

export function UserTable({ profiles, currentUserRole, onUpdate }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [viewingUser, setViewingUser] = useState<FullUserDetails | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    role: "student",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditFormData({
      fullName: user.full_name || "",
      role: user.role || "student",
    });
  };

  const handleDelete = (user: UserProfile) => {
    setDeletingUser(user);
  };

  const handleView = async (user: UserProfile) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await viewUser(user.id);
      
      if (result.success) {
        setViewingUser(result.user);
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to view user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateUserProfile(
        editingUser.id,
        editFormData.fullName,
        editFormData.role
      );

      if (result.success) {
        setEditingUser(null);
        onUpdate();
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to update user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteUser(deletingUser.id);

      if (result.success) {
        setDeletingUser(null);
        onUpdate();
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles?.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="font-medium">
                {profile.full_name || "N/A"}
              </TableCell>
              <TableCell>{profile.email || "N/A"}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    profile.role === "admin"
                      ? "destructive"
                      : profile.role === "staff"
                      ? "default"
                      : "secondary"
                  }
                >
                  {profile.role || "student"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {profile.email_confirmed_at ? "Active" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(profile.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(profile)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(profile)}
                  >
                    Edit
                  </Button>
                  {/* This logic is correct: Admins see all delete buttons.
                      Non-admins see delete buttons for non-admins. */}
                  {(currentUserRole === "admin" ||
                    profile.role !== "admin") && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(profile)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* View User Dialog */}
      <Dialog
        open={!!viewingUser}
        onOpenChange={() => setViewingUser(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Full Name</Label>
                <Input
                  value={viewingUser?.profile?.full_name || "N/A"}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  value={viewingUser?.profile?.email || viewingUser?.auth?.email || "N/A"}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Input
                  value={viewingUser?.profile?.role || "N/A"}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label>User ID</Label>
                <Input
                  value={viewingUser?.profile?.id || viewingUser?.auth?.id || "N/A"}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label>Created At</Label>
                <Input
                  value={viewingUser?.profile?.created_at ? new Date(viewingUser.profile.created_at).toLocaleString() : "N/A"}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label>Email Confirmed</Label>
                <Input
                  value={viewingUser?.profile?.email_confirmed_at ? "Yes" : "No"}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Input
                  value={viewingUser?.auth?.confirmed_at ? "Confirmed" : "Unconfirmed"}
                  disabled
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editFullName">Full Name</Label>
                <Input
                  id="editFullName"
                  value={editFormData.fullName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, fullName: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editEmail">Email (Read-only)</Label>
                <Input
                  id="editEmail"
                  value={editingUser?.email || ""}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editRole">Role</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    {currentUserRole === "admin" && (
                      <SelectItem value="admin">Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{deletingUser?.full_name || "N/A"}</p>
              <p className="text-sm text-gray-600">{deletingUser?.email}</p>
              <p className="text-sm text-gray-500">
                Role: {deletingUser?.role}
              </p>
              {currentUserRole === "admin" &&
                deletingUser?.role === "admin" && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ You are deleting another admin user
                  </p>
                )}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeletingUser(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}