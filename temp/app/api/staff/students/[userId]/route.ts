import { NextResponse } from "next/server";

// Mock detailed student data
const getMockStudentDetails = (userId: string) => {
  const baseStudent = {
    id: userId,
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
    skills: ["HTML", "CSS", "JavaScript", "React"],
    linkedin_handle: "johndoe",
    github_handle: "johndoe",
    photo_url: null,
  };

  // Add mock additional data
  return {
    ...baseStudent,
    gpa: 3.75,
    attendance_rate: 85,
    fyp_status: "not_started",
    projects: [
      {
        id: "proj1",
        title: "E-Commerce Platform",
        description: "Full-stack e-commerce solution with React and Node.js",
        status: "completed",
        created_at: "2024-03-01T00:00:00Z",
      },
      {
        id: "proj2",
        title: "Portfolio Website",
        description: "Personal portfolio website built with Next.js",
        status: "in_progress",
        created_at: "2024-03-15T00:00:00Z",
      },
    ],
    blog_posts: [
      {
        id: "blog1",
        title: "Getting Started with React",
        status: "approved",
        created_at: "2024-02-01T00:00:00Z",
      },
      {
        id: "blog2",
        title: "CSS Grid Layout Guide",
        status: "pending",
        created_at: "2024-02-15T00:00:00Z",
      },
    ],
    attendance_records: [
      { date: "2024-11-01", event: "Tech Workshop", status: "present" },
      { date: "2024-10-28", event: "Code Review Session", status: "present" },
      { date: "2024-10-25", event: "Guest Lecture", status: "late" },
      { date: "2024-10-22", event: "Club Meeting", status: "present" },
      { date: "2024-10-18", event: "Study Group", status: "absent" },
    ],
  };
};

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get mock student details
    const student = getMockStudentDetails(userId);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Error fetching student details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}