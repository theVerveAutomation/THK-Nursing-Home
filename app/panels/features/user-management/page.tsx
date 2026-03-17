"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Crown,
  Shield,
  User,
  Calendar,
  Download,
  Settings,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/types";

interface UserProfile extends Profile {
  status?: "active" | "inactive";
  last_login?: string;
  created_at?: string;
}

const roleIcons = {
  admin: Crown,
  manager: Shield,
  user: User,
};

const roleColors = {
  admin:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  manager: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
  user: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
};

export default function UserManagementPage() {
  const router = useRouter();
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [showAssignFeaturesModal, setShowAssignFeaturesModal] = useState(false);
  const [userToAssignFeatures, setUserToAssignFeatures] =
    useState<UserProfile | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // New user form state
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "user",
    password: "",
  });

  // Available features for assignment
  const availableFeatures = [
    {
      id: "video-analytics",
      name: "Video Analytics",
      description: "Access to video analytics dashboard",
    },
    {
      id: "camera-settings",
      name: "Camera Settings",
      description: "Configure camera settings",
    },
    {
      id: "user-management",
      name: "User Management",
      description: "Manage users and permissions",
    },
    {
      id: "reporting-analytics",
      name: "Reporting & Analytics",
      description: "Generate and view reports",
    },
    {
      id: "system-settings",
      name: "System Settings",
      description: "Configure system preferences",
    },
    {
      id: "live-monitoring",
      name: "Live Monitoring",
      description: "Real-time monitoring access",
    },
    {
      id: "alert-management",
      name: "Alert Management",
      description: "Manage alerts and notifications",
    },
    {
      id: "data-export",
      name: "Data Export",
      description: "Export data and reports",
    },
  ];

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        router.push("/Login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*, organizations!inner(displayid)")
        .eq("id", user.id)
        .single();

      if (!profile) {
        router.push("/Login");
        return;
      }
      setCurrentProfile(profile);
    };
    fetchCurrentUser();
  }, [router]);

  // Fetch users from the same organization
  useEffect(() => {
    if (!currentProfile) return;

    const fetchUsers = async () => {
      try {
        const { data: usersData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("organization_id", currentProfile.organization_id);

        if (error) throw error;

        // Add mock data for demonstration
        const dbUsers: UserProfile[] =
          usersData?.map((user: Profile) => ({
            ...user,
            status: Math.random() > 0.1 ? "active" : "inactive",
            last_login: new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            created_at: user.created_at || new Date().toISOString(),
          })) || [];

        // Add additional mock users for demonstration
        const additionalMockUsers: UserProfile[] = [
          {
            id: "mock-1",
            full_name: "John Anderson",
            email: "john.anderson@company.com",
            phone: "+1 (555) 123-4567",
            role: "admin",
            status: "active",
            last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            organization_id: currentProfile.organization_id,
            updated_at: new Date().toISOString(),
          },
          {
            id: "mock-2",
            full_name: "Sarah Mitchell",
            email: "sarah.mitchell@company.com",
            phone: "+1 (555) 234-5678",
            role: "manager",
            status: "active",
            last_login: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(
              Date.now() - 45 * 24 * 60 * 60 * 1000
            ).toISOString(),
            organization_id: currentProfile.organization_id,
            updated_at: new Date().toISOString(),
          },
          {
            id: "mock-3",
            full_name: "Michael Rodriguez",
            email: "michael.rodriguez@company.com",
            phone: "+1 (555) 345-6789",
            role: "user",
            status: "active",
            last_login: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
            created_at: new Date(
              Date.now() - 15 * 24 * 60 * 60 * 1000
            ).toISOString(),
            organization_id: currentProfile.organization_id,
            updated_at: new Date().toISOString(),
          },
          {
            id: "mock-4",
            full_name: "Emily Chen",
            email: "emily.chen@company.com",
            phone: "+1 (555) 456-7890",
            role: "manager",
            status: "inactive",
            last_login: new Date(
              Date.now() - 10 * 24 * 60 * 60 * 1000
            ).toISOString(),
            created_at: new Date(
              Date.now() - 60 * 24 * 60 * 60 * 1000
            ).toISOString(),
            organization_id: currentProfile.organization_id,
            updated_at: new Date().toISOString(),
          },
          {
            id: "mock-5",
            full_name: "David Thompson",
            email: "david.thompson@company.com",
            phone: "+1 (555) 567-8901",
            role: "user",
            status: "active",
            last_login: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(
              Date.now() - 20 * 24 * 60 * 60 * 1000
            ).toISOString(),
            organization_id: currentProfile.organization_id,
            updated_at: new Date().toISOString(),
          },
          {
            id: "mock-6",
            full_name: "Lisa Park",
            email: "lisa.park@company.com",
            phone: "+1 (555) 678-9012",
            role: "admin",
            status: "active",
            last_login: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            created_at: new Date(
              Date.now() - 90 * 24 * 60 * 60 * 1000
            ).toISOString(),
            organization_id: currentProfile.organization_id,
            updated_at: new Date().toISOString(),
          },
          {
            id: "mock-7",
            full_name: "Robert Wilson",
            email: "robert.wilson@company.com",
            phone: "+1 (555) 789-0123",
            role: "user",
            status: "active",
            last_login: new Date(
              Date.now() - 12 * 60 * 60 * 1000
            ).toISOString(),
            created_at: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            organization_id: currentProfile.organization_id,
            updated_at: new Date().toISOString(),
          },
          {
            id: "mock-8",
            full_name: "Anna Kowalski",
            email: "anna.kowalski@company.com",
            phone: "+1 (555) 890-1234",
            role: "manager",
            status: "active",
            last_login: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(
              Date.now() - 25 * 24 * 60 * 60 * 1000
            ).toISOString(),
            organization_id: currentProfile.organization_id,
            updated_at: new Date().toISOString(),
          },
          {
            id: "mock-9",
            full_name: "James Murphy",
            email: "james.murphy@company.com",
            phone: "+1 (555) 901-2345",
            role: "user",
            status: "inactive",
            last_login: new Date(
              Date.now() - 15 * 24 * 60 * 60 * 1000
            ).toISOString(),
            created_at: new Date(
              Date.now() - 40 * 24 * 60 * 60 * 1000
            ).toISOString(),
            organization_id: currentProfile.organization_id,
            updated_at: new Date().toISOString(),
          },
        ];

        const allUsers = [...dbUsers, ...additionalMockUsers];
        setUsers(allUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentProfile]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole, filterStatus]);

  const handleAddUser = async () => {
    // Here you would call your API to create a new user
    console.log("Adding user:", newUser);
    // Reset form and close modal
    setNewUser({
      full_name: "",
      email: "",
      phone: "",
      role: "user",
      password: "",
    });
    setShowAddUserModal(false);
  };

  const handleEditUser = (user: UserProfile) => {
    // Handle edit user functionality
    console.log("Editing user:", user);
  };

  const handleAssignFeatures = (user: UserProfile) => {
    setUserToAssignFeatures(user);
    // Load existing features for this user (mock data for now)
    const existingFeatures =
      user.role === "admin"
        ? availableFeatures.map((f) => f.id)
        : user.role === "manager"
        ? [
            "video-analytics",
            "camera-settings",
            "reporting-analytics",
            "live-monitoring",
          ]
        : ["video-analytics", "live-monitoring"];
    setSelectedFeatures(existingFeatures);
    setShowAssignFeaturesModal(true);
  };

  const handleSaveFeatures = async () => {
    if (!userToAssignFeatures) return;

    // Here you would call your API to save the feature assignments
    console.log(
      "Assigning features to user:",
      userToAssignFeatures,
      "Features:",
      selectedFeatures
    );

    // Close modal and reset state
    setShowAssignFeaturesModal(false);
    setUserToAssignFeatures(null);
    setSelectedFeatures([]);
  };

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleDeleteUser = (user: UserProfile) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    // Here you would call your API to delete the user
    console.log("Deleting user:", userToDelete);
    setUsers(users.filter((user) => user.id !== userToDelete.id));
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user accounts and permissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {users.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Users
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {users.filter((u) => u.status === "active").length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
            <Crown className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                New This Month
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {
                  users.filter((u) => {
                    const userDate = new Date(u.created_at || "");
                    const now = new Date();
                    return (
                      userDate.getMonth() === now.getMonth() &&
                      userDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
            <Calendar className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
              {filteredUsers.map((user) => {
                const RoleIcon =
                  roleIcons[user.role as keyof typeof roleIcons] || User;
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 flex items-center justify-center text-white font-bold text-sm">
                          {user.full_name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {user.full_name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
                          roleColors[user.role as keyof typeof roleColors] ||
                          roleColors.user
                        }`}
                      >
                        <RoleIcon className="w-3 h-3" />
                        {user.role?.charAt(0).toUpperCase() +
                          user.role?.slice(1) || "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {(user.status?.charAt(0).toUpperCase() || "") +
                          (user.status?.slice(1) || "") || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1 text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAssignFeatures(user)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Assign features"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No users found</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Add New User
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Delete User
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete {userToDelete.full_name}? This
                action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Features Modal */}
      {showAssignFeaturesModal && userToAssignFeatures && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Assign Features to {userToAssignFeatures.full_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Select the features this user should have access to
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-start gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={feature.id}
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={() => handleFeatureToggle(feature.id)}
                      className="mt-1 w-4 h-4 text-cyan-600 border-gray-300 dark:border-slate-600 rounded focus:ring-cyan-500 dark:focus:ring-cyan-600 dark:ring-offset-slate-800 focus:ring-2"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={feature.id}
                        className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                      >
                        {feature.name}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAssignFeaturesModal(false);
                  setUserToAssignFeatures(null);
                  setSelectedFeatures([]);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFeatures}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
              >
                Save Features
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
