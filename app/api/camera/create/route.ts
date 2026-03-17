import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
    const supabase = await createServerSupabaseClient();
  try {
    const body = await req.json();
    const { name, url, status, detection, alert_sound, frame_rate, resolution, organization_id } = body;
    console.log("Creating camera with data:", { name, url, status, detection, alert_sound, frame_rate, resolution, organization_id });
    if (!name || !url || !organization_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const { data, error } = await supabase.from("cameras").insert([
      { name, url, status, detection, alert_sound, frame_rate, resolution, organization_id }
    ]).select().single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ camera: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
