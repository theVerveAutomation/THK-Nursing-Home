import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CORS_HEADERS } from "@/lib/cors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if organization exists
    const { data: existingOrg, error: checkError } = await supabaseAdmin
      .from("organizations")
      .select("id, name")
      .eq("id", id)
      .single();

    if (checkError || !existingOrg) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Delete organization (this will cascade delete related records if configured)
    const { error: deleteError } = await supabaseAdmin
      .from("organizations")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Organization delete error:", deleteError);
      return NextResponse.json(
        { error: deleteError.message || "Failed to delete organization" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Organization deleted successfully",
        organization: {
          id: existingOrg.id,
          name: existingOrg.name,
        },
      },
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
