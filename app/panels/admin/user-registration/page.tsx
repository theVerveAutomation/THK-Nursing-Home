"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import { UserPlus, Lock, Building2, Mail } from "lucide-react";
import { Feature, Organization, Profile } from "@/types";

export default function UserRegistrationPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [orgId, setOrgId] = useState("");
  const [organizations, setOrganizations] = useState<
    { id: string; name: string }[]
  >([]);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [fullName, setFullName] = useState("");
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showServices, setShowServices] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  function toggleService(service: string) {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  }

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return router.replace("/Login");

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!prof) return router.replace("/Login");

      setProfile(prof);
      setOrgId("");
      await loadFeatures();
      // Fetch organizations for dropdown
      try {
        const res = await fetch("/api/organizations/fetch");
        const data = await res.json();
        if (res.ok && data.organizations) {
          setOrganizations(
            data.organizations.map((o: Organization) => ({
              id: o.id,
              name: o.name,
            }))
          );
        } else {
          setOrganizations([]);
        }
      } catch {
        setOrganizations([]);
      }
      setLoading(false);
    })();
  }, []);

  async function loadFeatures() {
    try {
      const { data, error } = await supabase
        .from("features")
        .select("*")
        .eq("enabled", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading features:", error);
        setFeatures([]);
      } else {
        setFeatures(data || []);
      }
    } catch (err) {
      console.error("Unexpected error loading features:", err);
      setFeatures([]);
    } finally {
      setLoadingFeatures(false);
    }
  }

  async function handleRegister() {
    if (
      !email ||
      !username ||
      !orgId ||
      !password ||
      !confirmPassword ||
      !fullName
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    const res = await fetch("/api/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        username,
        organization_id: orgId,
        role: "user",
        services: selectedServices,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setFormError(data.error || "Registration failed");
      return;
    }

    setFormError("");
    alert("User created successfully!");

    // Reset form

    setOrgId("");
    setEmail("");
    setUsername("");
    setFullName("");
    setOrganizationName("");
    setPassword("");
    setConfirmPassword("");
    setSelectedServices([]);
    setShowServices(false);

    router.push("/panels/admin/users");
  }

  if (loading || !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg text-slate-300 font-medium">
            Loading user registration...
          </span>
        </div>
      </div>
    );
  }

  // async function handleLogoUpload(file: File) {
  //   setUploadingLogo(true);

  //   const ext = file.name.split(".").pop();
  //   const fileName = `logos/${crypto.randomUUID()}.${ext}`;

  //   const { error } = await supabase.storage
  //     .from("products")
  //     .upload(fileName, file, {
  //       contentType: file.type,
  //       upsert: false,
  //     });

  //   if (error) {
  //     alert(error.message);
  //     setUploadingLogo(false);
  //     return;
  //   }

  //   const { data } = supabase.storage.from("products").getPublicUrl(fileName);

  //   setOrganizationLogo(data.publicUrl);
  //   setUploadingLogo(false);
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 mt-20 relative overflow-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <ShopNavbar
        fullName={profile.full_name}
        role={profile.role}
        organizationLogo={profile.organization_logo}
      />

      <div className="flex items-center justify-center py-8 px-6 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-lg shadow-primary/20 mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-400 to-blue-400 bg-clip-text text-transparent mb-2">
              User Registration
            </h1>
            <p className="text-slate-400">
              Register a new user under your organization
            </p>
          </div>

          {/* Form */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-800 p-8">
            <form className="space-y-4">
              {/* Organization Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Organization
                </label>
                <select
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm"
                >
                  <option value="">Select organization...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Organization Name */}
              {/* <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div> */}

              {/* Organization Logo */}
              {/* <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Organization Logo
                </label>

                <div className="flex items-center gap-4">
                  {organizationLogo ? (
                    <Image
                      src={organizationLogo}
                      alt="Organization Logo"
                      className="w-20 h-20 rounded-xl object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-sm">
                      No Logo
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleLogoUpload(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div> */}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>

              {/* SERVICES DROPDOWN */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Enabled Services
                </label>

                <button
                  type="button"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-left flex justify-between items-center hover:bg-slate-800/70 transition-colors"
                  onClick={() => setShowServices((v) => !v)}
                >
                  <span className="text-sm text-slate-300">
                    {selectedServices.length > 0
                      ? `${selectedServices.length} feature${
                          selectedServices.length > 1 ? "s" : ""
                        } selected`
                      : loadingFeatures
                      ? "Loading features..."
                      : "Select features"}
                  </span>
                  <span className="text-slate-500">▾</span>
                </button>

                {showServices && (
                  <div className="absolute z-20 mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-3 space-y-2 max-h-96 overflow-y-auto">
                    {loadingFeatures ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-slate-400">
                          Loading features...
                        </p>
                      </div>
                    ) : features.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-slate-400">
                          No features available
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Add features in Feature Management
                        </p>
                      </div>
                    ) : (
                      features.map((feature) => (
                        <label
                          key={feature.id}
                          className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/50 p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(feature.id)}
                            onChange={() => toggleService(feature.id)}
                            className="w-4 h-4 accent-primary"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-lg">
                              {feature.icon || "⚙️"}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-200">
                                {feature.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))
                    )}

                    <div className="pt-2 text-center border-t border-slate-700">
                      <button
                        type="button"
                        onClick={() => setShowServices(false)}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                  {formError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 py-3 border border-slate-700 bg-slate-800/50 text-slate-300 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleRegister}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-semibold hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 transition-all"
                >
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
