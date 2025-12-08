"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

interface CreateProjectDialogProps {
  userRole: string;
  userId: string;
  clusterId?: string;
  onProjectCreated?: () => void;
}

interface Cluster {
  id: string;
  name: string;
}

export function CreateProjectDialog({
  userRole,
  userId,
  clusterId,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: clusterId ? "cluster" : "personal",
    visibility: "public",
    cluster_id: clusterId || "",
    repository_url: "",
    demo_url: "",
  });

  // Fetch clusters where user can create projects
  useEffect(() => {
    const fetchClusters = async () => {
      if (userRole === "admin" || userRole === "staff") {
        // Admins and staff can see all clusters
        const supabase = createClient();
        const { data, error } = await supabase
          .from("clusters")
          .select("id, name")
          .eq("status", "active")
          .order("name");

        if (!error && data) {
          setClusters(data);
        }
      } else if (userRole === "lead" || userRole === "deputy") {
        // Leads and deputies can only see their managed clusters
        const supabase = createClient();
        const { data, error } = await supabase
          .from("clusters")
          .select("id, name")
          .or(`lead_id.eq.${userId},deputy_id.eq.${userId},staff_manager_id.eq.${userId}`)
          .eq("status", "active")
          .order("name");

        if (!error && data) {
          setClusters(data);
        }
      }
    };

    if (open && !clusterId) {
      fetchClusters();
    }
  }, [open, userRole, userId, clusterId]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      // Validate cluster project
      if (formData.type === "cluster" && !formData.cluster_id) {
        toast.error("Please select a cluster for cluster projects");
        setLoading(false);
        return;
      }

      // Create project
      const projectData: any = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        visibility: formData.visibility,
        owner_id: userId,
        repository_url: formData.repository_url || null,
        demo_url: formData.demo_url || null,
      };

      if (formData.type === "cluster") {
        projectData.cluster_id = formData.cluster_id;
      }

      console.log("Attempting to create project with data:", projectData);

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert(projectData)
        .select()
        .single();

      if (projectError) {
        console.error("Project creation error details:", projectError);
        throw projectError;
      }

      // Add owner as a member with owner role
      const { error: memberError } = await supabase
        .from("project_members")
        .insert({
          project_id: project.id,
          user_id: userId,
          role: "owner",
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: userId,
        });

      if (memberError) {
        console.error("Member addition error details:", memberError);
        throw memberError;
      }

      // Add tags
      if (tags.length > 0) {
        const tagInserts = tags.map((tag) => ({
          project_id: project.id,
          tag: tag,
        }));

        const { error: tagsError } = await supabase
          .from("project_tags")
          .insert(tagInserts);

        if (tagsError) throw tagsError;
      }

      toast.success("Project created successfully!");
      setOpen(false);
      resetForm();
      if (onProjectCreated) onProjectCreated();
    } catch (error: any) {
      console.error("Error creating project:", JSON.stringify(error, null, 2));
      toast.error("Failed to create project: " + (error.message || error.details || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: clusterId ? "cluster" : "personal",
      visibility: "public",
      cluster_id: clusterId || "",
      repository_url: "",
      demo_url: "",
    });
    setTags([]);
    setTagInput("");
  };

  const canCreateClusterProjects =
    userRole === "admin" || userRole === "staff" || userRole === "lead" || userRole === "deputy";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new {clusterId ? "cluster" : "personal or cluster"} project. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="E-Commerce Platform"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="A full-stack e-commerce solution with modern features..."
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            {/* Project Type */}
            {!clusterId && (
              <div className="space-y-2">
                <Label htmlFor="type">Project Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value, cluster_id: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Project</SelectItem>
                    {canCreateClusterProjects && (
                      <SelectItem value="cluster">Cluster Project</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Cluster Selection */}
            {formData.type === "cluster" && !clusterId && (
              <div className="space-y-2">
                <Label htmlFor="cluster">Select Cluster *</Label>
                <Select
                  value={formData.cluster_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cluster_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    {clusters.map((cluster) => (
                      <SelectItem key={cluster.id} value={cluster.id}>
                        {cluster.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Visibility */}
            {formData.type === "personal" && (
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility *</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) =>
                    setFormData({ ...formData, visibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      Public - Anyone can view
                    </SelectItem>
                    <SelectItem value="private">
                      Private - Only members can view
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Repository URL */}
            <div className="space-y-2">
              <Label htmlFor="repository_url">Repository URL</Label>
              <Input
                id="repository_url"
                type="url"
                placeholder="https://github.com/username/repo"
                value={formData.repository_url}
                onChange={(e) =>
                  setFormData({ ...formData, repository_url: e.target.value })
                }
              />
            </div>

            {/* Demo URL */}
            <div className="space-y-2">
              <Label htmlFor="demo_url">Demo/Live URL</Label>
              <Input
                id="demo_url"
                type="url"
                placeholder="https://demo.example.com"
                value={formData.demo_url}
                onChange={(e) =>
                  setFormData({ ...formData, demo_url: e.target.value })
                }
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Technologies/Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="React, Node.js, TypeScript..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="pr-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
