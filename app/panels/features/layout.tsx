import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { Feature } from "@/types";
import ClientLayout from "./ClientLayout";

export default async function AuthenticationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  // const [openEmployees, setOpenEmployees] = useState(
  //   pathname.startsWith("/panels/features/employees")
  // );

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/Login");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/Login");
    return;
  }

  const { data: userFeatures, error: featuresError } = await supabase
    .from("user_features")
    .select("feature_id, features!inner(*)")
    .eq("user_id", user.id)
    .eq("features.enabled", true);

  if (featuresError) {
    console.error("Error fetching features:", featuresError);
  }
  const assignedFeatures: Feature[] =
    userFeatures
      ?.map((uf: any) => uf.features)
      .filter((f: Feature) => f !== null) || [];

  return (
    <ClientLayout profile={profile} features={assignedFeatures || []}>
      {children}
    </ClientLayout>
  );
}
