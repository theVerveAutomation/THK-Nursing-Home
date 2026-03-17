import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CORS_HEADERS } from "@/lib/cors";

export async function GET(req: NextRequest) {
  try {
    // Fetch all organizations with user count from profiles
    const { data: organizations, error } = await supabaseAdmin
      .from("organizations")
      .select(`
        *,
        profiles (
          id
        )
      `)
      .order("created_at", { ascending: false });


    if (error) {
      console.error("Fetch organizations error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch organizations" },
        { status: 500 }
      );
    }

    // Transform data to include user count
    const organizationsWithCount = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      displayid: org.displayid,
      contact_email: org.email,
      created_at: org.created_at,
      user_count: org.profiles?.length || 0,
    }));

    return NextResponse.json(
      { organizations: organizationsWithCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}
