import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Profile } from "@/types";

export async function POST(req: Request) {
  try {
    const { id, username, role, email, organization_logo, features } = await req.json();

    if (!id || !username || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Build update object dynamically
    const updateData: Partial<Profile> = {
      username,
      role,
    };

    // Only update email if provided
    if (email) {
      updateData.email = email;
    }

    // Only update organization_logo if provided (allow empty string to clear logo)
    // if (organization_logo !== undefined) {
    //   updateData.organization_logo = organization_logo;
    // }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update user features if provided
    if (features !== undefined && Array.isArray(features)) {
      // Delete existing features
      const { error: deleteError } = await supabaseAdmin
        .from("user_features")
        .delete()
        .eq("user_id", id);

      if (deleteError) {
        console.error("Error deleting existing features:", deleteError);
        return NextResponse.json(
          { error: "Failed to update features: " + deleteError.message },
          { status: 500 }
        );
      }

      console.log("Existing features deleted for user:", id);

      // Insert new features
      if (features.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from("user_features")
          .insert(
            features.map((featureId) => ({
              user_id: id,
              feature_id: featureId,
            }))
          );

        if (insertError) {
          console.error("Error inserting new features:", insertError);
          return NextResponse.json(
            { error: "Failed to update features: " + insertError.message },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}