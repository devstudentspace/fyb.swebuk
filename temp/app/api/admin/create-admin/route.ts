import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { email, password, firstName, surname } = body;

    // Validate required fields
    if (!email || !password || !firstName || !surname) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Simple admin key check (in production, use more secure method)
    const adminKey = process.env.ADMIN_CREATION_KEY || "ADMIN2024";
    const providedKey = body.adminKey;

    if (providedKey !== adminKey) {
      return NextResponse.json({ error: "Invalid admin key" }, { status: 401 });
    }

    // Create auth user with admin role
    const { data: authUser, error: createAuthError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "administrator",
        full_name: `${firstName} ${surname}`.trim(),
        department: "Software Engineering",
        institution: "Bayero University Kano",
        staff_number: `ADMIN${Date.now().toString().slice(-4)}`,
        staff_type: "administrator",
      },
    });

    if (createAuthError) {
      return NextResponse.json({ error: createAuthError.message }, { status: 400 });
    }

    // Create user profile (if using user_profiles table)
    try {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: authUser.user.id,
          email: authUser.user.email!,
          role: "administrator",
          first_name: firstName,
          surname: surname,
          department: "Software Engineering",
          institution: "Bayero University Kano",
          staff_number: `ADMIN${Date.now().toString().slice(-4)}`,
          staff_type: "administrator",
          is_active: true,
          created_at: authUser.user.created_at,
        });

      if (profileError) {
        // Log error but don't fail the request
        console.error("Profile creation error:", profileError);
      }
    } catch (profileErr) {
      console.error("Profile creation failed:", profileErr);
    }

    return NextResponse.json({
      message: "Admin user created successfully",
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        role: "administrator",
        first_name: firstName,
        surname: surname,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}