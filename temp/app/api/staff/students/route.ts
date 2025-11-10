import { NextResponse } from "next/server";

// Mock students data for testing
const mockStudents = [
  {
    id: "3",
    email: "student1@swebuk.com",
    role: "student",
    first_name: "John",
    surname: "Doe",
    middle_name: "",
    department: "Software Engineering",
    institution: "Bayero University Kano",
    academic_level: 300,
    registration_number: "202300123",
    is_active: true,
    is_suspended: false,
    created_at: "2024-01-03T00:00:00Z",
    cluster_id: "cluster1",
    clusters: { name: "Frontend Club" },
    cluster_members: { status: "approved", role: "member", joined_at: "2024-01-15T00:00:00Z" },
    skills: ["HTML", "CSS", "JavaScript"],
    linkedin_handle: "johndoe",
    github_handle: "johndoe",
    photo_url: null,
  },
  {
    id: "4",
    email: "student2@swebuk.com",
    role: "student",
    first_name: "Jane",
    surname: "Smith",
    middle_name: "",
    department: "Software Engineering",
    institution: "Bayero University Kano",
    academic_level: 400,
    registration_number: "202400456",
    is_active: true,
    is_suspended: false,
    created_at: "2024-01-04T00:00:00Z",
    cluster_id: "cluster2",
    clusters: { name: "AI/ML Club" },
    cluster_members: { status: "pending", role: "member", joined_at: "2024-02-01T00:00:00Z" },
    skills: ["Python", "Machine Learning", "TensorFlow"],
    linkedin_handle: "janesmith",
    github_handle: "janesmith",
    photo_url: null,
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get("search") || "";
    const cluster = searchParams.get("cluster") || "";
    const academicLevel = searchParams.get("academic_level") || "";
    const status = searchParams.get("status") || "";

    // Apply filters
    let filteredStudents = mockStudents;

    if (search) {
      filteredStudents = filteredStudents.filter(student =>
        student.first_name.toLowerCase().includes(search.toLowerCase()) ||
        student.surname.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase()) ||
        student.registration_number?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (cluster && cluster !== "all") {
      filteredStudents = filteredStudents.filter(student => student.cluster_id === cluster);
    }

    if (academicLevel && academicLevel !== "all") {
      filteredStudents = filteredStudents.filter(student => student.academic_level === parseInt(academicLevel));
    }

    if (status) {
      if (status === "suspended") {
        filteredStudents = filteredStudents.filter(student => student.is_suspended);
      } else if (status === "inactive") {
        filteredStudents = filteredStudents.filter(student => !student.is_active);
      } else if (status === "active") {
        filteredStudents = filteredStudents.filter(student => student.is_active && !student.is_suspended);
      }
    }

    return NextResponse.json({
      students: filteredStudents,
      total: filteredStudents.length,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}