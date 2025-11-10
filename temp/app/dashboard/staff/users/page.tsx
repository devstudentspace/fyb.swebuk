"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  GraduationCap,
  BookOpen,
  Calendar,
  RefreshCw,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { StudentDetailsModal } from "@/components/staff/student-details-modal";
import { User } from "@supabase/supabase-js";

interface Student {
  id: string;
  email: string;
  role: string;
  first_name: string;
  surname: string;
  middle_name?: string;
  department: string;
  academic_level: number;
  registration_number: string;
  is_active: boolean;
  is_suspended: boolean;
  created_at: string;
  cluster_id?: string;
  clusters?: { name: string };
  cluster_members?: {
    status: string;
    role: string;
    joined_at: string;
  };
  skills?: string[];
  fyp_status?: string;
  gpa?: number;
  attendance_rate?: number;
}

interface StaffProfile {
  id: string;
  managed_cluster_ids: string[];
  clusters?: Array<{
    id: string;
    name: string;
    member_count: number;
  }>;
}

export default function StaffUserManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clusterFilter, setClusterFilter] = useState("");
  const [academicLevelFilter, setAcademicLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      // Get staff profile first to determine managed clusters
      const staffResponse = await fetch("/api/staff/profile");
      if (!staffResponse.ok) return;

      const staffData = await staffResponse.json();
      setStaffProfile(staffData.staff);

      // Fetch students with filters
      const params = new URLSearchParams({
        role: "student",
        ...(searchTerm && { search: searchTerm }),
        ...(clusterFilter && clusterFilter !== "all" && { cluster: clusterFilter }),
        ...(academicLevelFilter && academicLevelFilter !== "all" && { academic_level: academicLevelFilter }),
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/staff/students?${params}`);
      const data = await response.json();

      if (response.ok) {
        setStudents(data.students || []);
      } else {
        console.error("Error fetching students:", data.error);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, clusterFilter, academicLevelFilter, statusFilter, refreshKey]);

  const getAcademicLevelBadge = (level: number) => {
    const colors = {
      100: "bg-blue-100 text-blue-800",
      200: "bg-green-100 text-green-800",
      300: "bg-yellow-100 text-yellow-800",
      400: "bg-purple-100 text-purple-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (student: Student) => {
    if (student.is_suspended) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (!student.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getFYPStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig = {
      "not_started": { label: "Not Started", variant: "secondary" as const },
      "proposal": { label: "Proposal", variant: "default" as const },
      "in_progress": { label: "In Progress", variant: "default" as const },
      "review": { label: "Under Review", variant: "secondary" as const },
      "completed": { label: "Completed", variant: "default" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleStudentAction = async (action: string, student: Student) => {
    switch (action) {
      case "view":
        setSelectedStudent(student);
        setIsDetailsModalOpen(true);
        break;
      case "approve_membership":
        try {
          const response = await fetch(`/api/staff/clusters/${student.cluster_id}/members/${student.id}/approve`, {
            method: "POST",
          });
          if (response.ok) {
            setRefreshKey(prev => prev + 1);
          }
        } catch (error) {
          console.error("Error approving membership:", error);
        }
        break;
      case "assign_fyp":
        // Open FYP assignment modal
        break;
    }
  };

  const getClusterName = (student: Student) => {
    return student.clusters?.name || "No Cluster";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">
            Manage students in your assigned clusters and supervise their academic progress
          </p>
        </div>
        <Button variant="outline" onClick={() => setRefreshKey(prev => prev + 1)}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Staff Overview */}
      {staffProfile && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managed Clusters</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staffProfile.clusters?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">400 Level Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.academic_level === 400).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">FYP Students</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.academic_level === 400 && s.fyp_status !== "not_started").length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={clusterFilter} onValueChange={setClusterFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by cluster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clusters</SelectItem>
                {staffProfile?.clusters?.map((cluster) => (
                  <SelectItem key={cluster.id} value={cluster.id}>
                    {cluster.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={academicLevelFilter} onValueChange={setAcademicLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Academic Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="100">100 Level</SelectItem>
                <SelectItem value="200">200 Level</SelectItem>
                <SelectItem value="300">300 Level</SelectItem>
                <SelectItem value="400">400 Level</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({students.length})</CardTitle>
          <CardDescription>
            Students in your assigned clusters and under your supervision
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No students found</h3>
              <p className="text-muted-foreground">
                {searchTerm || clusterFilter || academicLevelFilter || statusFilter
                  ? "Try adjusting your filters"
                  : "No students are currently assigned to your clusters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Cluster</TableHead>
                    <TableHead>FYP Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {student.first_name[0]}{student.surname[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.first_name} {student.surname}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.registration_number}
                      </TableCell>
                      <TableCell>
                        <Badge className={getAcademicLevelBadge(student.academic_level)}>
                          {student.academic_level} Level
                        </Badge>
                      </TableCell>
                      <TableCell>{getClusterName(student)}</TableCell>
                      <TableCell>
                        {getFYPStatusBadge(student.fyp_status) || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(student)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStudentAction("view", student)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {student.cluster_members?.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleStudentAction("approve_membership", student)}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Approve Membership
                              </DropdownMenuItem>
                            )}
                            {student.academic_level === 400 && (
                              <DropdownMenuItem onClick={() => handleStudentAction("assign_fyp", student)}>
                                <GraduationCap className="w-4 h-4 mr-2" />
                                Assign FYP
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Modal */}
      <StudentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
    </div>
  );
}