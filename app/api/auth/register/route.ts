import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username, full_name, organization_id, role = "user" } = body;

    // Validate required fields
    if (!email || !password || !username || !full_name || !organization_id) {
      return NextResponse.json(
        { error: "Email, password, username, full name, and organization ID are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: authError.message || "Failed to create user" },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create profile in database
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      username,
      full_name,
      organization_id:  organization_id ,
      role: role,
      email: email,
    });

    if (profileError) {
      console.error("Profile error:", profileError);
      
      // Clean up: delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username,
          full_name,
          organization_id,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
