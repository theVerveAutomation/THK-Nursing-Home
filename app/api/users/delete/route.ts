import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  // Delete from auth.users table (this should cascade to profiles if FK is set up)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // Also explicitly delete from profiles table in case cascade isn't configured
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", id);

  if (profileError) {
    console.warn("Profile deletion error (may already be deleted):", profileError.message);
  }

  return NextResponse.json({ success: true });
}
