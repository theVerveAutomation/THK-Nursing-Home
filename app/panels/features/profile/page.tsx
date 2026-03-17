"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/types";
import {
  User,
  Mail,
  Building,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setEditedProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editedProfile.full_name,
          username: editedProfile.username,
          organization_name: editedProfile.organization_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...editedProfile });
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 w-full">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            Failed to load profile. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your account information
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Picture & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Picture Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {profile.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                {editing && (
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-4">
                {profile.full_name || "User"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{profile.username}
              </p>
              <span
                className={`mt-3 px-4 py-1.5 rounded-full text-xs font-medium ${
                  profile.role === "admin"
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                }`}
              >
                {profile.role?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-700 p-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Account Status
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Status
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Member Since
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editedProfile.full_name || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        full_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <div className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-800 dark:text-white">
                    {profile.full_name || "N/A"}
                  </div>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editedProfile.username || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        username: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <div className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-800 dark:text-white">
                    {profile.username || "N/A"}
                  </div>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Role (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <div className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 flex items-center gap-2 capitalize">
                  <Shield className="w-4 h-4" />
                  {profile.role}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Contact admin to change role
                </p>
              </div>
            </div>
          </div>

          {/* Organization Information */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Organization Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editedProfile.organization_name || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        organization_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <div className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-800 dark:text-white">
                    {profile.organization_name || "Not set"}
                  </div>
                )}
              </div>

              {/* Organization ID (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization ID
                </label>
                <div className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 font-mono text-xs">
                  {profile.organization_id || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Account Metadata */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Account Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Created At */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Created
                </label>
                <div className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-800 dark:text-white">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </div>
              </div>

              {/* Updated At */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Updated
                </label>
                <div className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-800 dark:text-white">
                  {profile.updated_at
                    ? new Date(profile.updated_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
