import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const organization_id = searchParams.get("organization_id");
  const camera_id = searchParams.get("camera_id");

  let query = supabase
    .from("camera_snaps")
    .select("*")
    .order("created_at", { ascending: false });

  // Filter by organization if provided
//   if (organization_id) {
//     query = query.eq("organization_id", organization_id);
//   }

  // Filter by camera if provided
//   if (camera_id) {
//     query = query.eq("camera_id", camera_id);
//   }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ snapshots: data });
}
