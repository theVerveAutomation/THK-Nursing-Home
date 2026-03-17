"use client";

import { Profile } from "@/types";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface MobileHeaderProps {
  profile: Profile;
  setSidebarOpen: (open: boolean) => void;
}

export default function MobileHeader({
  profile,
  setSidebarOpen,
}: MobileHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 shadow-md border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-blue-700 dark:from-blue-400 dark:to-blue-400 bg-clip-text text-transparent">
            AI VAP
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme Toggle - Mobile */}

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          <div
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 
              flex items-center justify-center text-white font-bold text-sm shadow-md"
          >
            {profile.username?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </div>
  );
}
