import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  try {
    const { searchParams } = new URL(req.url);
    const organization_id = searchParams.get("organization_id");
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
       
           if (!user) {
               return NextResponse.redirect("/Login");
             }
       
             const { data: profile } = await supabase
               .from("profiles")
               .select("*")
               .eq("id", user.id)
               .single();
       
             if (!profile) {
               return NextResponse.redirect("/Login");
             }
    if (!organization_id) {
      return NextResponse.json({ error: "Missing organization_id" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("cameras")
      .select("*")
      .eq("organization_id", organization_id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ cameras: data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
