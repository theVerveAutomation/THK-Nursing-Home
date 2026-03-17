"use client";
import { Organization } from "@/types";
import { X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function OrganizationModal({
  organization,
  currentUserId,
  onClose,
  onSaved,
}: {
  organization: Organization | null;
  currentUserId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    displayid: organization?.displayid || "",
    email: organization?.contact_email || "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const endpoint = organization
        ? "/api/organizations/update"
        : "/api/organizations/create";

      const body = organization
        ? { id: organization.id, ...formData, contact_email: formData.email }
        : {
            ...formData,
            created_by: currentUserId,
            contact_email: formData.email,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to save organization");
        return;
      }

      toast.success(
        organization
          ? "Organization updated successfully!"
          : "Organization created successfully!"
      );
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to save organization");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {organization ? "Edit Organization" : "Create Organization"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              placeholder="Enter organization name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Display ID
            </label>
            <input
              type="text"
              value={formData.displayid}
              onChange={(e) =>
                setFormData({ ...formData, displayid: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              placeholder="e.g., ORG001"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              placeholder="contact@organization.com"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : organization
                ? "Update Organization"
                : "Create Organization"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
