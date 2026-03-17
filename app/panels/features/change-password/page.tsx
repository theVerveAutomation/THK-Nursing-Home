"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import { Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Profile } from "@/types";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return router.replace("/Login");

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (!prof) return router.replace("/Login");

      setProfile(prof);
      setLoading(false);
    })();
  }, []);

  async function handleChangePassword() {
    if (!password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully");
    setPassword("");
    setConfirmPassword("");
  }

  if (loading || !profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 mt-20">
      <ShopNavbar
        fullName={profile.full_name}
        role={profile.role}
        organizationLogo={profile.organization_logo}
      />

      <div className="flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-800 p-6">
          <h1 className="text-xl font-semibold text-center mb-6 text-white">
            Change Password
          </h1>

          <div className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white py-2 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
