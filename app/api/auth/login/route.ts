import { withCors, corsOptions } from "@/lib/cors";
import {createServerSupabaseClient} from '@/lib/supabaseServer'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Handle OPTIONS
export function OPTIONS() {
  return corsOptions();
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  try {
    const body = await req.json();
    const { orgDisplayid, username, password, debug } = body;


    // -------- DEBUG OUTPUT --------
    if (debug === true) {
      return withCors({
        debug: true,
        received_orgId: orgDisplayid ?? null,
        received_username: username ?? null,
        env_supabase_url: SUPABASE_URL ?? "undefined",
        env_anon_key: ANON_KEY ? "loaded" : "missing",
        profileUrl_example:
          `${SUPABASE_URL}/rest/v1/profiles?organization_id=eq.${orgDisplayid}&username=eq.${username}&select=*`
      });
    }
    // ------------------------------

    if (!orgDisplayid || !username || !password) {
      return withCors({ error: "Missing fields" }, 400);
    }

    const cleanOrgDisplayid = orgDisplayid.trim();

    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("displayid", cleanOrgDisplayid)
      .single();

    if (orgError || !orgData) {
      return withCors({ 
        error: "Invalid credentials",
      }, 401);
    }

    const cleanUsername = username.trim();

    // Fetch profile using organization_id and username
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("organization_id", orgData.id)
      .eq("username", cleanUsername)
      .single();


    if (profileError || !profile) {
      return withCors({ 
        error: "Invalid credentials", 
        debug: {
          searched_org_id: orgData.id,
          searched_username: cleanUsername,
          error_detail: profileError?.message,
          hint: "User not found with this org_id and username combination"
        }
      }, 401);
    }

    // Login using email + password
    const tokenRes = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
        },
        body: JSON.stringify({
          email: profile.email,
          password,
        }),
      }
    );

    const tokenJson = await tokenRes.json();

    if (!tokenRes.ok) {
      return withCors(
        { error: tokenJson.error_description || "Incorrect password" },
        401
      );
    }

    return withCors({
      success: true,
      token: tokenJson,
      profile,
    });

  } catch (err: any) {
    return withCors({ 
      error: "Server error", 
      detail: err.message 
    }, 500);
  }
}
