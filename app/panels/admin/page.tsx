"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import { Users, Video, Boxes, Building2 } from "lucide-react";
import { Profile } from "@/types";

export default function AdminHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return router.push("/Login");

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(prof);
      setLoading(false);
    })();
  }, [router]);

  if (loading || !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg text-slate-300 font-medium">
            Loading admin panel...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-56 h-56 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/3 left-1/2 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <ShopNavbar
        fullName={profile.full_name}
        role={profile.role}
        organizationLogo={profile.organization_logo}
      />

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 blur-xl opacity-40 rounded-full"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-3 rounded-2xl shadow-lg shadow-primary/20">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                  <Video className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-blue-400 to-blue-400 bg-clip-text text-transparent">
            VAP Admin Panel
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            AI-powered video analytics platform for intelligent surveillance and
            insights
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management card */}
          <div className="group relative">
            <div
              className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 pb-10 transition-all duration-300 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 hover:border-primary/50 cursor-pointer"
              onClick={() => router.push("/panels/admin/users")}
            >
              <div className="mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 blur-lg opacity-30 rounded-full"></div>
                <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-2xl flex items-center justify-center border border-primary/40">
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">
                User Management
              </h3>
              <p className="text-slate-400 mb-3 leading-relaxed text-sm text-center">
                Manage users, permissions, and access control for your
                organization
              </p>
            </div>
          </div>

          {/* Shop Management card */}
          <div className="group relative">
            <div
              className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 pb-10 transition-all duration-300 shadow-lg shadow-blue-600/5 hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-1 hover:border-blue-600/50 cursor-pointer"
              onClick={() => router.push("/panels/admin/products")}
            >
              <div className="mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 blur-lg opacity-30 rounded-full"></div>
                <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl flex items-center justify-center border border-blue-600/40">
                  <Video className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">
                Shop Management
              </h3>
              <p className="text-slate-400 mb-3 leading-relaxed text-sm text-center">
                Manage shop products, inventory, and business operations
              </p>
            </div>
          </div>

          {/* Feature Management card */}
          <div className="group relative">
            <div
              className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 pb-10 transition-all duration-300 shadow-lg shadow-blue-600/5 hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-1 hover:border-blue-600/50 cursor-pointer"
              onClick={() => router.push("/panels/admin/features")}
            >
              <div className="mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-600 blur-lg opacity-30 rounded-full"></div>
                <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-blue-600/20 to-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-600/40">
                  <Boxes className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">
                Feature Management
              </h3>
              <p className="text-slate-400 mb-3 leading-relaxed text-sm text-center">
                Configure and manage available features and services
              </p>
            </div>
          </div>

          {/* Organization Management card */}
          <div className="group relative">
            <div
              className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 pb-10 transition-all duration-300 shadow-lg shadow-emerald-600/5 hover:shadow-xl hover:shadow-emerald-600/20 hover:-translate-y-1 hover:border-emerald-600/50 cursor-pointer"
              onClick={() => router.push("/panels/admin/organizations")}
            >
              <div className="mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-600 blur-lg opacity-30 rounded-full"></div>
                <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-2xl flex items-center justify-center border border-emerald-600/40">
                  <Building2 className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">
                Organization Management
              </h3>
              <p className="text-slate-400 mb-3 leading-relaxed text-sm text-center">
                Manage organizations, settings, and business entities
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900/70 backdrop-blur-sm rounded-full shadow-lg border border-slate-800">
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
            <span className="text-xs font-medium text-slate-300">
              VAP System Active - All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
