import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CORS_HEADERS } from "@/lib/cors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {displayid, name, email } = body;

    // Validate required fields
    if (!displayid || !name ) {
      return NextResponse.json(
        { error: "Organization display ID and name are required" },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "Organization name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Check if organization name already exists
    const { data: existingOrg, error: checkError } = await supabaseAdmin
      .from("organizations")
      .select("id, name")
      .eq("name", name.trim())
      .single();

    if (existingOrg) {
      return NextResponse.json(
        { error: "An organization with this name already exists" },
        { status: 409 }
      );
    }

    // Create organization
    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        displayid: displayid.trim(),
        name: name.trim(),
        email: email?.trim() || null,
      })
      .select()
      .single();

    if (orgError) {
      console.error("Organization creation error:", orgError);
      return NextResponse.json(
        { error: orgError.message || "Failed to create organization" },
        { status: 500 }
      );
    }


    return NextResponse.json(
      {
        message: "Organization created successfully",
        organization: {
            id: organization.id,
            displayid: organization.displayid,
            name: organization.name,
            email: organization.email,
            created_at: organization.created_at,
        },
      },
      { status: 201 }
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
