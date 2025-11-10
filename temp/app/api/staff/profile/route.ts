import { NextResponse } from "next/server";

// Mock staff profile data for testing
const mockStaffProfile = {
  id: "2",
  role: "staff",
  managed_cluster_ids: ["cluster1", "cluster2"],
  clusters: [
    {
      id: "cluster1",
      name: "Frontend Club",
      member_count: 15,
    },
    {
      id: "cluster2",
      name: "AI/ML Club",
      member_count: 12,
    },
  ],
};

export async function GET(request: Request) {
  try {
    return NextResponse.json({ staff: mockStaffProfile });
  } catch (error) {
    console.error("Error fetching staff profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}