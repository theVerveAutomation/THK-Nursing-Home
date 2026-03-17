"use client";
import { Profile } from "@/types";
import {
  AlertCircle,
  Book,
  Camera,
  CameraIcon,
  ChevronDown,
  Key,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  profile: Profile;
  profileMenuOpen: boolean;
  setProfileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  theme,
  setTheme,
  profile,
  profileMenuOpen,
  setProfileMenuOpen,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        w-64 sm:w-72 md:w-64 lg:w-1/5 xl:w-1/6
        bg-white dark:bg-slate-900 shadow-xl border-r border-slate-200 dark:border-slate-700
        max-h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      {/* Logo & Header Section */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-slate-800 dark:to-slate-800 relative">
        {/* Centered Logo and Text */}
        <div className="flex flex-col items-center justify-center w-full">
          <Image
            src="/logo-thk.png"
            alt="Video Analytics Pro Logo"
            className="h-20 w-20 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain rounded-xl scale-150"
            width={160}
            height={160}
            priority
          />
          <p className="text-sm sm:text-sm md:text-sm text-slate-500 dark:text-slate-400 font-medium hidden sm:block mt-5">
            Video Analytics Pro
          </p>
        </div>

        {/* Action Buttons - Positioned absolutely */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle - Desktop */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden lg:flex p-1.5 sm:p-2 rounded-lg hover:bg-cyan-100 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300" />
            )}
          </button>

          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-cyan-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2 overflow-y-auto">
        {/* Dashboard */}
        <button
          onClick={() => router.push("/panels/features")}
          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200
              ${
                pathname === "/panels/features"
                  ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/30 scale-105"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
              }`}
        >
          <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">Dashboard</span>
        </button>

        {/* Employees Dropdown */}
        {/* <div className="space-y-1">
          <button
            onClick={() => setOpenEmployees(!openEmployees)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all duration-200
                ${
                  pathname.startsWith("/panels/features/employees")
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span>Employees</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                openEmployees ? "rotate-180" : ""
              }`}
            />
          </button>
          Dropdown Items
          <div
            className={`ml-4 pl-4 border-l-2 border-blue-200 dark:border-blue-700 space-y-1 overflow-hidden transition-all duration-300 ${
              openEmployees ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            Employee Registration
            <button
              onClick={() => router.push("/panels/features/employees/register")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                  ${
                    pathname === "/panels/features/employees/register"
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">Registration</span>
            </button>
            Attendance
            <button
              onClick={() =>
                router.push("/panels/features/employees/attendance")
              }
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                  ${
                    pathname === "/panels/features/employees/attendance"
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span className="text-sm">Attendance</span>
            </button>
            Reports
            <button
              onClick={() => router.push("/panels/features/employees/reports")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                  ${
                    pathname === "/panels/features/employees/reports"
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Reports</span>
            </button>
          </div>
        </div> */}

        {/* Schedule */}
        {/* <button
            onClick={() => router.push("/panels/features/schedule")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200
              ${
                pathname === "/panels/features/schedule"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                  : "text-slate-700 hover:bg-slate-100 hover:scale-105"
              }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span>Schedule</span>
          </button> */}

        {/* enabled feature links*/}
        {/* {features.map((feature) => {
          const url = feature.name.split(" ").join("").toLowerCase();
          return (
            <button
              key={feature.id}
              onClick={() => {
                router.push(`/panels/features/${url}`);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200
              ${
                pathname ===
                `/panels/features/${feature.name
                  .toLowerCase()
                  .split(" ")
                  .join("-")}`
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30 scale-105"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
              }`}
            >
              <span>{feature.name}</span>
            </button>
          );
        })} */}
        {/* Camera Settings */}
        <button
          onClick={() => router.push("/panels/features/videoanalytics")}
          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200
              ${
                pathname === "/panels/features/videoanalytics"
                  ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/30 scale-105"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
              }`}
        >
          <Video className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">Video Analytics</span>
        </button>
        <button
          onClick={() => router.push("/panels/features/reporting&analytics")}
          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200
              ${
                pathname === "/panels/features/reporting&analytics"
                  ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/30 scale-105"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
              }`}
        >
          <Book className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">Reports</span>
        </button>
        <button
          onClick={() => router.push("/panels/features/camera-settings")}
          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200
              ${
                pathname === "/panels/features/camera-settings"
                  ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/30 scale-105"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
              }`}
        >
          <Camera className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">Camera Settings</span>
        </button>
        <button
          onClick={() => router.push("/panels/features/alertmanagement")}
          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200
              ${
                pathname === "/panels/features/alertmanagement"
                  ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/30 scale-105"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
              }`}
        >
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">Alert Management</span>
        </button>
        <button
          onClick={() => router.push("/panels/features/user-management")}
          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200
              ${
                pathname === "/panels/features/user-management"
                  ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/30 scale-105"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
              }`}
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">User Management</span>
        </button>
        {/* <button
          onClick={() => router.push("/panels/features/snapshots")}
          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200
              ${
                pathname === "/panels/features/snapshots"
                  ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/30 scale-105"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
              }`}
        >
          <CameraIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">Snapshots</span>
        </button> */}
      </nav>

      {/* Profile Section */}
      <div className="flex-shrink-0 p-2 sm:p-3 md:p-4 border-t border-slate-200 dark:border-slate-700">
        {/* Profile Button */}
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="group w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl 
            bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800 
            hover:from-cyan-50 hover:to-sky-50 dark:hover:from-cyan-900/30 dark:hover:to-cyan-900/30
            border border-slate-200 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-700 transition-all duration-300"
        >
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 
            flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md flex-shrink-0"
          >
            {profile.full_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {profile.full_name || "User"}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 capitalize truncate">
              {profile.role || "Member"}
            </p>
          </div>
          {profileMenuOpen ? (
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-slate-400 dark:text-slate-500 transition-transform rotate-180" />
          ) : (
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-slate-400 dark:text-slate-500 transition-transform" />
          )}
        </button>

        {/* Profile Menu Options */}
        <div
          className={`mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1 overflow-hidden transition-all duration-300 ${
            profileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* View Profile */}
          <button
            onClick={() => router.push("/panels/features/profile")}
            className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 rounded-lg text-slate-600 dark:text-slate-400 
              hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200"
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">View Profile</span>
          </button>

          {/* Change Password */}
          <button
            onClick={() => router.push("/panels/features/change-password")}
            className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 rounded-lg text-slate-600 dark:text-slate-400 
              hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200"
          >
            <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">Change Password</span>
          </button>

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-700 my-1 sm:my-2"></div>

          {/* Logout */}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/Login");
            }}
            className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 rounded-lg text-red-600 dark:text-red-400 
              hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">
              Log Out
            </span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex-shrink-0 w-full p-2 sm:p-3 md:p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 text-center">
          {/* <p className="font-medium">Version 1.0.0</p> */}
          <div className="mt-2 flex justify-center">
            <Image
              src="/vap-logo.jpeg"
              alt="Video Analytics Pro Logo"
              width={32}
              height={32}
              className="h-12 w-12 rounded-md object-contain"
            />
          </div>
          <p className="mt-0.5 sm:mt-1 font-medium">
            Powered by Video Analytics Pro
          </p>
          <p className="mt-0.5 sm:mt-1">© {new Date().getFullYear()}</p>
        </div>
      </div>
    </aside>
  );
}
