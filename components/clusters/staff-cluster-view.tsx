"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  FileText,
  AlertCircle,
  Clock,
  Settings,
  TrendingUp,
  UserPlus,
  Shield,
  Crown,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClusterMembersList } from "./cluster-members-list";
import { ClusterProjectsList } from "./cluster-projects-list";
import { ClusterEventsList } from "./cluster-events-list";
import { ClusterRequestsList } from "./cluster-requests-list";

interface DetailedCluster {
  id: string;
  name: string;
  description: string;
  created_at: string;
  status: string;
  lead_id: string | null;
  lead_name: string | null;
  lead_email: string | null;
  deputy_id: string | null;
  deputy_name: string | null;
  deputy_email: string | null;
  staff_manager_id: string | null;
  staff_manager_name: string | null;
  staff_manager_email: string | null;
  members_count: number;
}

interface User {
  id: string;
  role: string;
}

interface StaffClusterViewProps {
  cluster: DetailedCluster;
  user: User;
  isMember: boolean;
  hasPendingRequest: boolean;
  userMembershipStatus: string | null;
  canManage: boolean;
  canManageProjects: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

async function fetchClusterStats(clusterId: string) {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  // Get project count - use detailed_projects view for cluster projects
  const { count: projectCount } = await supabase
    .from("detailed_projects")
    .select("*", { count: "exact", head: true })
    .eq("cluster_id", clusterId);

  // Get upcoming events count
  const { count: eventsCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("cluster_id", clusterId)
    .gte("start_date", new Date().toISOString());

  // Get pending requests count
  const { count: pendingCount } = await supabase
    .from("cluster_members")
    .select("*", { count: "exact", head: true })
    .eq("cluster_id", clusterId)
    .eq("status", "pending");

  return {
    projects: projectCount || 0,
    events: eventsCount || 0,
    pendingRequests: pendingCount || 0,
  };
}

export function StaffClusterView({
  cluster,
  user,
  isMember,
  hasPendingRequest,
  userMembershipStatus,
  canManage,
  canManageProjects,
  onJoin,
  onLeave,
}: StaffClusterViewProps) {
  const router = useRouter();
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [stats, setStats] = useState<{ projects: number; events: number; pendingRequests: number }>({
    projects: 0,
    events: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    fetchClusterStats(cluster.id).then(setStats).catch(console.error);
  }, [cluster.id]);

  const handleJoinClick = () => {
    setJoinDialogOpen(true);
  };

  const confirmJoin = () => {
    setJoinDialogOpen(false);
    onJoin();
  };

  const handleLeaveClick = () => {
    setLeaveDialogOpen(true);
  };

  const confirmLeave = () => {
    setLeaveDialogOpen(false);
    onLeave();
  };

  const isManager = cluster.lead_id === user.id ||
                    cluster.deputy_id === user.id ||
                    cluster.staff_manager_id === user.id;

  return (
    <div className="space-y-6">
      {/* Hero Header - Sleek Supabase Style */}
      <Card className="relative overflow-hidden border-border bg-gradient-to-br from-card to-muted/40 shadow-sm">
        <div className="absolute top-0 right-0 -mt-24 -mr-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{cluster.name}</h1>
                  <Badge variant={cluster.status === 'active' ? 'default' : 'secondary'} className={cluster.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : ''}>
                    {cluster.status}
                  </Badge>
                  {isManager && (
                    <Badge variant="outline" className="bg-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Manager
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-base max-w-3xl leading-relaxed">{cluster.description || "No description provided."}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 shrink-0">
                {canManage && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2 h-9 border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-600"
                    onClick={() => router.push(`/dashboard/clusters/${cluster.id}/settings`)}
                  >
                    <Settings className="h-4 w-4" />
                    Manage Cluster
                  </Button>
                )}
                {!isMember && !hasPendingRequest && !canManage && (
                  <Button 
                    variant="default" 
                    size="sm"
                    className="gap-2 h-9 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleJoinClick}
                  >
                    <UserPlus className="h-4 w-4" />
                    Join Cluster
                  </Button>
                )}
                {hasPendingRequest && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2 h-9 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-600"
                    onClick={handleLeaveClick}
                  >
                    <Clock className="h-4 w-4" />
                    Cancel Request
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards - Sleek Implementation */}
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        <Card className="hover:shadow-md transition-all duration-300 hover:scale-[1.02] border-border/50">
          <CardContent className="p-2 sm:p-6 flex flex-col items-center text-center">
            <div className="p-1.5 sm:p-2.5 rounded-xl bg-purple-500/10 mb-2 sm:mb-3">
              <Users className="h-4 w-4 sm:h-6 sm:w-6 text-purple-500" />
            </div>
            <p className="text-lg sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">{cluster.members_count}</p>
            <p className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate w-full">Members</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:scale-[1.02] border-border/50">
          <CardContent className="p-2 sm:p-6 flex flex-col items-center text-center">
            <div className="p-1.5 sm:p-2.5 rounded-xl bg-blue-500/10 mb-2 sm:mb-3">
              <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500" />
            </div>
            <p className="text-lg sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">{stats.projects}</p>
            <p className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate w-full">Projects</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:scale-[1.02] border-border/50">
          <CardContent className="p-2 sm:p-6 flex flex-col items-center text-center">
            <div className="p-1.5 sm:p-2.5 rounded-xl bg-emerald-500/10 mb-2 sm:mb-3">
              <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-500" />
            </div>
            <p className="text-lg sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">{stats.events}</p>
            <p className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate w-full">Events</p>
          </CardContent>
        </Card>

        {isManager && (
          <Card className={`hover:shadow-md transition-all duration-300 hover:scale-[1.02] ${stats.pendingRequests > 0 ? 'border-amber-500/50 bg-amber-500/5' : 'border-border/50'}`}>
            <CardContent className="p-2 sm:p-6 flex flex-col items-center text-center">
              <div className={`p-1.5 sm:p-2.5 rounded-xl mb-2 sm:mb-3 ${stats.pendingRequests > 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-500/10 text-slate-400'}`}>
                <AlertCircle className={`h-4 w-4 sm:h-6 sm:w-6 ${stats.pendingRequests > 0 ? 'animate-pulse' : ''}`} />
              </div>
              <p className="text-lg sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">{stats.pendingRequests}</p>
              <p className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate w-full">Requests</p>
            </CardContent>
          </Card>
        )}

        <Card className="hover:shadow-md transition-all duration-300 hover:scale-[1.02] border-border/50">
          <CardContent className="p-2 sm:p-6 flex flex-col items-center text-center">
            <div className="p-1.5 sm:p-2.5 rounded-xl bg-cyan-500/10 mb-2 sm:mb-3">
              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-cyan-500" />
            </div>
            <p className="text-xs sm:text-lg font-bold text-foreground mb-0.5 sm:mb-1">{new Date(cluster.created_at).toLocaleDateString()}</p>
            <p className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate w-full">Created</p>
          </CardContent>
        </Card>
      </div>

      {/* Leadership & Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leadership Team
            </h2>
            <p className="text-slate-400 text-sm mt-1">Cluster management personnel</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold text-lg">
                {cluster.lead_name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{cluster.lead_name || "Not assigned"}</p>
                <p className="text-xs text-slate-400 truncate">{cluster.lead_email || "Email not available"}</p>
              </div>
              <Crown className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                {cluster.deputy_name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{cluster.deputy_name || "Not assigned"}</p>
                <p className="text-xs text-slate-400 truncate">{cluster.deputy_email || "Email not available"}</p>
              </div>
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg">
                {cluster.staff_manager_name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{cluster.staff_manager_name || "Not assigned"}</p>
                <p className="text-xs text-slate-400 truncate">{cluster.staff_manager_email || "Email not available"}</p>
              </div>
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </div>

        {isManager && (
          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Management
              </h2>
              <p className="text-slate-400 text-sm mt-1">Common actions</p>
            </div>
            <div className="space-y-2">
              {stats.pendingRequests > 0 && (
                <button
                  className="w-full flex items-center justify-start gap-3 p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-medium transition-all duration-200 hover:scale-105"
                  onClick={() => {
                    const requestsTrigger = document.querySelector('[value="requests"]') as HTMLElement;
                    requestsTrigger?.click();
                  }}
                >
                  <AlertCircle className="h-4 w-4" />
                  Review Requests ({stats.pendingRequests})
                </button>
              )}
              <button
                className="w-full flex items-center justify-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-200 hover:scale-105"
                onClick={() => router.push(`/dashboard/clusters/${cluster.id}/settings`)}
              >
                <Settings className="h-4 w-4" />
                Edit Cluster Details
              </button>
              {canManageProjects && (
                <button
                  className="w-full flex items-center justify-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-200 hover:scale-105"
                  onClick={() => router.push(`/dashboard/projects/create?cluster_id=${cluster.id}`)}
                >
                  <FileText className="h-4 w-4" />
                  Create New Project
                </button>
              )}
              <button
                className="w-full flex items-center justify-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-200 hover:scale-105"
                onClick={() => router.push(`/dashboard/clusters/events/new?cluster_id=${cluster.id}`)}
              >
                <Calendar className="h-4 w-4" />
                Create New Event
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle>Cluster Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="members" className="w-full">
            <div className="px-4 sm:px-6">
              <TabsList className="w-full sm:w-auto grid sm:inline-flex grid-cols-2 sm:h-9 h-auto items-start sm:items-center justify-start bg-muted/50 p-1 rounded-lg overflow-x-auto max-w-full">
                <TabsTrigger value="members" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow min-w-max">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Members</span>
                  <span className="sm:hidden">Members</span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">{cluster.members_count}</Badge>
                </TabsTrigger>
                <TabsTrigger value="projects" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow min-w-max">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Projects</span>
                  <span className="sm:hidden">Projects</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow min-w-max">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Events</span>
                  <span className="sm:hidden">Events</span>
                </TabsTrigger>
                {(isMember || isManager) && (
                  <TabsTrigger value="requests" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow relative min-w-max">
                    <AlertCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Requests</span>
                    <span className="sm:hidden">Requests</span>
                    {stats.pendingRequests > 0 && (
                      <Badge variant="destructive" className="h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full">
                        {stats.pendingRequests}
                      </Badge>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
            <div className="p-6">
              <TabsContent value="members" className="mt-0">
                <ClusterMembersList clusterId={cluster.id} userRole={user.role} canManage={canManage} />
              </TabsContent>
              <TabsContent value="projects" className="mt-0">
                <ClusterProjectsList clusterId={cluster.id} userRole={user.role} userId={user.id} isMember={isMember} canManage={canManageProjects} />
              </TabsContent>
              <TabsContent value="events" className="mt-0">
                <ClusterEventsList
                  clusterId={cluster.id}
                  userRole={user.role}
                  userId={user.id}
                  isMember={isMember}
                  canManage={canManage}
                />
              </TabsContent>
              {(isMember || isManager) && (
                <TabsContent value="requests" className="mt-0">
                  <ClusterRequestsList
                    clusterId={cluster.id}
                    userRole={user.role}
                    userId={user.id}
                    hasPendingRequest={hasPendingRequest}
                    canManage={canManage}
                  />
                </TabsContent>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Join Dialog */}
      <AlertDialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request to Join Cluster?</AlertDialogTitle>
            <AlertDialogDescription>
              A request will be sent to the cluster leaders for approval. You will be notified once your request has been reviewed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmJoin}>
              Send Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Dialog */}
      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove you from the cluster. If you have a pending request, it will be cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave} className="bg-destructive hover:bg-destructive/90">
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
