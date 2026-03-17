import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CORS_HEADERS } from "@/lib/cors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, displayid, description, address, contact_email, contact_phone } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {};
    
    if (name !== undefined) {
      if (name.trim().length < 2) {
        return NextResponse.json(
          { error: "Organization name must be at least 2 characters" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (displayid !== undefined) updateData.displayid = displayid.trim() || null;
    if (description !== undefined) updateData.description = description.trim() || null;
    if (address !== undefined) updateData.address = address.trim() || null;
    if (contact_phone !== undefined) updateData.contact_phone = contact_phone.trim() || null;

    // Validate email format if provided
    if (contact_email !== undefined) {
      if (contact_email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact_email)) {
          return NextResponse.json(
            { error: "Invalid email format" },
            { status: 400 }
          );
        }
        updateData.contact_email = contact_email.trim();
      } else {
        updateData.contact_email = null;
      }
    }

    // Check if organization exists
    const { data: existingOrg, error: checkError } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existingOrg) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if new name conflicts with existing organization
    if (updateData.name) {
      const { data: nameConflict } = await supabaseAdmin
        .from("organizations")
        .select("id")
        .eq("name", updateData.name)
        .neq("id", id)
        .single();

      if (nameConflict) {
        return NextResponse.json(
          { error: "An organization with this name already exists" },
          { status: 409 }
        );
      }
    }

    // Update organization
    const { data: organization, error: updateError } = await supabaseAdmin
      .from("organizations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Organization update error:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update organization" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Organization updated successfully",
        organization: {
          id: organization.id,
          name: organization.name,
          displayid: organization.displayid,
          description: organization.description,
          address: organization.address,
          contact_email: organization.contact_email,
          contact_phone: organization.contact_phone,
          updated_at: organization.updated_at,
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
