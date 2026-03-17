import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      full_name,
      logo_url,
      username,
      organization_id,
      role,
      services, // NEW
    } = await req.json();


    if (!email || !password || !full_name || !username || !organization_id || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({ 
        email, 
        password,
        email_confirm: true 
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Auth creation failed" },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name,
        username,
        organization_id,
        role,
        organization_logo: logo_url,
      });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Assign selected features to the user
    const selectedServices: string[] =
      Array.isArray(services) ? services : [];

    if (selectedServices.length > 0) {
      const { error: featureError } = await supabaseAdmin
        .from("user_features")
        .insert(
          selectedServices.map((featureId) => ({
            user_id: userId,
            feature_id: featureId,
            assigned_by: null, // Can be updated to track who assigned it
          }))
        );

      if (featureError) {
        console.error("Error assigning features:", featureError);
        return NextResponse.json(
          { error: "User created but failed to assign features: " + featureError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
