"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UpdateUserModal from "@/components/UpdateUserModal";
import {
  Users,
  Pencil,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Building2,
  Shield,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Profile } from "@/types";

export default function UserManagementPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return router.replace("/Login");

      fetchUsers();
    })();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users/fetch");
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to fetch users");
        return;
      }

      console.log("Fetched users:", data);
      setUsers(data.users);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  async function refreshUsers() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/users/fetch");
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to refresh users");
        return;
      }

      setUsers(data.users);
      toast.success("Users refreshed!");
    } catch {
      toast.error("Failed to refresh users");
    } finally {
      setRefreshing(false);
    }
  }

  function filterUsers() {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(query) ||
          user.organization_name?.toLowerCase().includes(query) ||
          user.organization_id?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.full_name?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }

  async function deleteUser(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const res = await fetch("/api/users/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    });

    console.log("Delete response:", res);

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Delete failed");
      return;
    }

    toast.success("User deleted successfully!");
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  const uniqueRoles = Array.from(new Set(users.map((u) => u.role))).filter(
    Boolean
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-300 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-800 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-lg shadow-primary/20">
                <Users className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-400 to-blue-400 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Manage and monitor all registered users
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/panels/admin/user-registration")}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/50"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
              <button
                onClick={refreshUsers}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg border border-primary/40">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-600/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-600/40">
                  <Filter className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">
                    Filtered Results
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {filteredUsers.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-600/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-600/40">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">
                    Organizations
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {new Set(users.map((u) => u.organization_id)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-800 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by username, email, org ID, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Filter by Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-800 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr className="text-left text-sm font-semibold text-slate-300">
                  <th className="p-4">User</th>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Org ID</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Users className="w-16 h-16 mx-auto text-slate-700 mb-3" />
                      <p className="text-slate-500 font-medium">
                        {searchQuery || roleFilter !== "all"
                          ? "No users match your filters"
                          : "No users found"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {u.organization_logo ? (
                            <Image
                              src={u.organization_logo}
                              alt="Logo"
                              className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-200">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">
                              {u.username || "N/A"}
                            </p>
                            {u.email && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {u.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-200">
                          {u.organization_name || "N/A"}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 font-mono text-sm rounded-full font-semibold">
                          {u.display_orgId || "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                            u.role === "admin"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : u.role === "user"
                              ? "bg-blue-600/20 text-blue-400 border-blue-600/30"
                              : "bg-slate-700/50 text-slate-300 border-slate-600"
                          }`}
                        >
                          {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-all hover:scale-110"
                            title="Edit User"
                            onClick={() => setEditingUser(u)}
                          >
                            <Pencil className="w-5 h-5" />
                          </button>

                          <button
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
                            title="Delete User"
                            onClick={() => deleteUser(u.id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => router.back()}
            className="group relative px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 flex items-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-blue-600/50 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>

            <span className="relative z-10">Go Back</span>

            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
          </button>
        </div>
      </div>

      {/* UPDATE USER MODAL */}
      {editingUser && (
        <UpdateUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={fetchUsers}
        />
      )}
    </div>
  );
}
