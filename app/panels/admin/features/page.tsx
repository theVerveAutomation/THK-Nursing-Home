"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import { Boxes, Plus, Trash2, ArrowLeft, Check, X, Save } from "lucide-react";
import { toast } from "sonner";

interface Feature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon?: string;
  created_at?: string;
}

const AVAILABLE_FEATURES = [
  {
    id: "authentication",
    name: "Authentication",
    description: "Access authentication dashboard",
    icon: "🔐",
  },
  {
    id: "video-analytics",
    name: "Video Analytics",
    description: "AI-powered video analysis and insights",
    icon: "🎥",
  },
  {
    id: "object-detection",
    name: "Object Detection",
    description: "Identify and track objects in video streams",
    icon: "🎯",
  },
  {
    id: "face-recognition",
    name: "Face Recognition",
    description: "Identify and verify individuals",
    icon: "👤",
  },
  {
    id: "motion-detection",
    name: "Motion Detection",
    description: "Detect and alert on movement patterns",
    icon: "🏃",
  },
  {
    id: "alert-management",
    name: "Alert Management",
    description: "Configure and manage system alerts",
    icon: "🔔",
  },
  {
    id: "reporting-analytics",
    name: "Reporting & Analytics",
    description: "Generate reports and insights",
    icon: "📊",
  },
  {
    id: "live-monitoring",
    name: "Live Monitoring",
    description: "Real-time video stream monitoring",
    icon: "📹",
  },
];

export default function FeaturesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFeature, setNewFeature] = useState({
    name: "",
    description: "",
    icon: "",
    enabled: true,
  });
  const [saving, setSaving] = useState(false);

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

      if (!prof || prof.role !== "admin") {
        toast.error("Access denied");
        return router.replace("/Login");
      }

      setProfile(prof);
      await loadFeatures();
      setLoading(false);
    })();
  }, [router]);

  async function loadFeatures() {
    try {
      // First, try to fetch from database
      const { data: dbFeatures, error } = await supabase
        .from("features")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading features:", error);
        // If table doesn't exist, initialize with default features
        if (error.code === "42P01") {
          toast.info(
            "Initializing features... Please create the features table."
          );
          const initialFeatures = AVAILABLE_FEATURES.map((f) => ({
            ...f,
            enabled: true,
          }));
          setFeatures(initialFeatures);
        } else {
          toast.error("Failed to load features");
        }
        return;
      }

      if (dbFeatures && dbFeatures.length > 0) {
        setFeatures(dbFeatures);
      } else {
        // Database is empty, show default features
        const initialFeatures = AVAILABLE_FEATURES.map((f) => ({
          ...f,
          enabled: true,
        }));
        setFeatures(initialFeatures);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Failed to load features");
    }
  }

  async function toggleFeature(featureId: string) {
    const feature = features.find((f) => f.id === featureId);
    if (!feature) return;

    const newEnabledState = !feature.enabled;

    // Optimistic update
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === featureId ? { ...f, enabled: newEnabledState } : f
      )
    );

    // Update in database
    const { error } = await supabase
      .from("features")
      .update({ enabled: newEnabledState })
      .eq("id", featureId);

    if (error) {
      console.error("Error toggling feature:", error);
      toast.error("Failed to update feature");
      // Revert optimistic update
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === featureId ? { ...f, enabled: !newEnabledState } : f
        )
      );
    } else {
      toast.success("Feature updated");
    }
  }

  async function handleAddFeature() {
    if (!newFeature.name || !newFeature.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("features")
        .insert([
          {
            name: newFeature.name,
            description: newFeature.description,
            icon: newFeature.icon || "⚙️",
            enabled: newFeature.enabled,
          },
        ])
        .select();

      if (error) {
        console.error("Error adding feature:", error);
        toast.error("Failed to add feature");
        return;
      }

      if (data && data.length > 0) {
        setFeatures((prev) => [...prev, data[0]]);
        toast.success("Feature added successfully");
        setShowAddModal(false);
        setNewFeature({
          name: "",
          description: "",
          icon: "",
          enabled: true,
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Failed to add feature");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFeature(featureId: string) {
    if (!confirm("Are you sure you want to delete this feature?")) return;

    const { error } = await supabase
      .from("features")
      .delete()
      .eq("id", featureId);

    if (error) {
      console.error("Error deleting feature:", error);
      toast.error("Failed to delete feature");
      return;
    }

    setFeatures((prev) => prev.filter((f) => f.id !== featureId));
    toast.success("Feature deleted");
  }

  if (loading || !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <span className="text-lg text-slate-300 font-medium">
            Loading features...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <ShopNavbar
        fullName={profile.full_name}
        role={profile.role}
        organizationLogo={profile.organization_logo}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-emerald-600 blur-lg opacity-40 rounded-2xl" />
              <div className="relative p-4 bg-gradient-to-br from-cyan-500 to-emerald-600 rounded-2xl shadow-lg shadow-cyan-500/20">
                <Boxes className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                Feature Management
              </h1>
              <p className="mt-1 text-slate-400">
                Configure available features and services
              </p>
            </div>
          </div>

          {/* ADD FEATURE BUTTON */}
          <button
            onClick={() => setShowAddModal(true)}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-600 blur-lg opacity-50 rounded-xl group-hover:opacity-70 transition-opacity" />
            <div className="relative bg-gradient-to-r from-cyan-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 group-hover:scale-105 transition-all flex items-center gap-2 font-semibold">
              <Plus className="w-5 h-5" />
              Add Feature
            </div>
          </button>
        </div>

        {/* SUMMARY */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-800 p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/40">
                  <Boxes className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">
                    Total Features
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {features.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/40">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">Enabled</p>
                  <p className="text-2xl font-bold text-white">
                    {features.filter((f) => f.enabled).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/40">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">Disabled</p>
                  <p className="text-2xl font-bold text-white">
                    {features.filter((f) => !f.enabled).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border transition-all duration-300 ${
                feature.enabled
                  ? "border-cyan-500/30 shadow-cyan-500/10"
                  : "border-slate-800"
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{feature.icon || "⚙️"}</div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {feature.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-sm text-slate-400">
                    {feature.enabled ? "Enabled" : "Disabled"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteFeature(feature.id)}
                      className="px-3 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleFeature(feature.id)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                        feature.enabled
                          ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40"
                          : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40"
                      }`}
                    >
                      {feature.enabled ? (
                        <>
                          <X className="w-4 h-4" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Enable
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD FEATURE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md mx-4 overflow-hidden">
            {/* MODAL HEADER */}
            <div className="bg-gradient-to-r from-cyan-500 to-emerald-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Plus className="w-6 h-6" />
                Add New Feature
              </h2>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Feature Name *
                </label>
                <input
                  type="text"
                  value={newFeature.name}
                  onChange={(e) =>
                    setNewFeature({ ...newFeature, name: e.target.value })
                  }
                  placeholder="e.g., Video Analytics"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={newFeature.description}
                  onChange={(e) =>
                    setNewFeature({
                      ...newFeature,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of this feature"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={newFeature.icon}
                  onChange={(e) =>
                    setNewFeature({ ...newFeature, icon: e.target.value })
                  }
                  placeholder="⚙️"
                  maxLength={2}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                <span className="text-sm font-medium text-slate-300">
                  Enable by default
                </span>
                <button
                  onClick={() =>
                    setNewFeature({
                      ...newFeature,
                      enabled: !newFeature.enabled,
                    })
                  }
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    newFeature.enabled
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      : "bg-slate-700/50 text-slate-400 border border-slate-600"
                  }`}
                >
                  {newFeature.enabled ? "Yes" : "No"}
                </button>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewFeature({
                    name: "",
                    description: "",
                    icon: "",
                    enabled: true,
                  });
                }}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFeature}
                disabled={saving || !newFeature.name || !newFeature.description}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-600 hover:from-cyan-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Add Feature
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BACK BUTTON */}
      <button
        onClick={() => router.back()}
        className="fixed bottom-8 left-8 group z-40"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-600 blur-xl opacity-50 rounded-full group-hover:opacity-70 transition-opacity" />
        <div className="relative bg-gradient-to-r from-cyan-500 to-emerald-600 text-white px-6 py-4 rounded-full shadow-2xl shadow-cyan-500/20 group-hover:shadow-cyan-500/40 group-hover:scale-105 transition-all flex items-center gap-3">
          <ArrowLeft className="w-6 h-6" />
          <span className="font-semibold text-lg">Go Back</span>
        </div>
      </button>
    </div>
  );
}
