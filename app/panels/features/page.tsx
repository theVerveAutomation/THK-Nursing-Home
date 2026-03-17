"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Profile } from "@/types";
import { Camera, Activity, Shield, Clock, AlertTriangle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import RecentEvents from "@/components/RecentEvents";

const stats = [
  {
    title: "Cameras Online",
    value: "5",
    subtitle: "of 5 total",
    icon: Camera,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-900/30",
    border: "border-cyan-200 dark:border-cyan-800",
  },
  {
    title: "High-Risk Events (24h)",
    value: "70",
    subtitle: "All detections",
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/30",
    border: "border-red-200 dark:border-red-800",
  },
  {
    title: "Most Frequent Detection",
    value: "Fall",
    subtitle: "39 events in last 24h",
    icon: Activity,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/30",
    border: "border-orange-200 dark:border-orange-800",
  },
  {
    title: "System Health",
    value: "98%",
    subtitle: "All systems operational",
    icon: Shield,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-900/30",
    border: "border-sky-200 dark:border-sky-800",
  },
];

const detectionsByType = [
  { name: "Pacing Detection", value: 12, color: "#06b6d4" },
  { name: "Erratic Movements Detection", value: 7, color: "#a21caf" },
  { name: "Arm Flailing Detection", value: 15, color: "#f59e42" },
  { name: "Facial Expressions Detection", value: 9, color: "#eab308" },
  { name: "Thermal Indicators Detection", value: 5, color: "#14b8a6" },
  { name: "Aggression Detection", value: 8, color: "#f43f5e" },
  { name: "Intrusion Detection", value: 4, color: "#6366f1" },
  { name: "Fall Detection", value: 39, color: "#ef4444" },
  { name: "Escape Attempts Detection", value: 3, color: "#f97316" },
  { name: "Staff Detection", value: 18, color: "#22d3ee" },
  { name: "Tussle Detection", value: 31, color: "#f97316" },
];

const hourlyDetections = [
  {
    hour: "6AM",
    pacing: 2,
    erratic: 1,
    armFlailing: 3,
    facial: 0,
    thermal: 1,
    aggression: 0,
    intrusion: 0,
    fall: 1,
    escape: 0,
    staff: 2,
    tussle: 0,
  },
  {
    hour: "9AM",
    pacing: 1,
    erratic: 2,
    armFlailing: 2,
    facial: 1,
    thermal: 0,
    aggression: 1,
    intrusion: 0,
    fall: 3,
    escape: 0,
    staff: 3,
    tussle: 2,
  },
  {
    hour: "12PM",
    pacing: 3,
    erratic: 0,
    armFlailing: 2,
    facial: 2,
    thermal: 1,
    aggression: 2,
    intrusion: 1,
    fall: 4,
    escape: 1,
    staff: 2,
    tussle: 3,
  },
  {
    hour: "3PM",
    pacing: 2,
    erratic: 1,
    armFlailing: 4,
    facial: 1,
    thermal: 0,
    aggression: 1,
    intrusion: 0,
    fall: 5,
    escape: 1,
    staff: 4,
    tussle: 4,
  },
  {
    hour: "6PM",
    pacing: 1,
    erratic: 2,
    armFlailing: 1,
    facial: 0,
    thermal: 1,
    aggression: 0,
    intrusion: 1,
    fall: 3,
    escape: 0,
    staff: 2,
    tussle: 2,
  },
  {
    hour: "9PM",
    pacing: 0,
    erratic: 1,
    armFlailing: 2,
    facial: 1,
    thermal: 0,
    aggression: 2,
    intrusion: 0,
    fall: 2,
    escape: 1,
    staff: 1,
    tussle: 1,
  },
];

const cameraStatus = [
  { id: 1, name: "Camera 1", status: "online", detections: 145 },
  { id: 2, name: "Camera 2", status: "online", detections: 89 },
  { id: 3, name: "Camera 3", status: "online", detections: 23 },
  { id: 4, name: "Camera 4", status: "offline", detections: 0 },
  { id: 5, name: "Camera 5", status: "online", detections: 67 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

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

      setProfile(prof);
      setLoading(false);
    })();
  }, []);

  if (loading || !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg text-slate-600 dark:text-slate-300 font-medium">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-slate-900 relative overflow-hidden">
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                Video Analytics Pro Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time detection monitoring overview
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Last updated: Just now</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((item) => (
              <div
                key={item.title}
                className={`bg-white dark:bg-slate-800 border-2 ${item.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {item.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                      {item.value}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {item.subtitle}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg}`}
                  >
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Detection by Type */}
            <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Detections by Type
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Distribution of detection events (24h)
              </p>

              <ResponsiveContainer width="100%" height={224}>
                <PieChart>
                  <Pie
                    data={detectionsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {detectionsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--tooltip-bg, #1e293b)",
                      border: "1px solid var(--tooltip-border, #334155)",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Hourly Detection Trend */}
            <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Hourly Detection Trend
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Detection activity throughout the day
              </p>

              <ResponsiveContainer width="100%" height={224}>
                <BarChart data={hourlyDetections} barCategoryGap={"60%"}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="hour"
                    stroke="#9ca3af"
                    tick={{ fill: "#9ca3af", angle: -30, dy: 10, fontSize: 12 }}
                  />
                  <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                      fontSize: 13,
                    }}
                    wrapperStyle={{ zIndex: 1000 }}
                    itemStyle={{ display: "block", margin: 0, fontSize: 13 }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#9ca3af", fontSize: 12 }}
                    layout="horizontal"
                    align="center"
                    verticalAlign="top"
                    iconSize={10}
                  />
                  <Bar
                    dataKey="pacing"
                    name="Pacing Detection"
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]}
                    barSize={8}
                  />
                  <Bar
                    dataKey="erratic"
                    name="Erratic Movements Detection"
                    fill="#a21caf"
                    radius={[4, 4, 0, 0]}
                    barSize={8}
                  />
                  <Bar
                    dataKey="armFlailing"
                    name="Arm Flailing Detection"
                    fill="#f59e42"
                    radius={[4, 4, 0, 0]}
                    barSize={8}
                  />
                  <Bar
                    dataKey="facial"
                    name="Facial Expressions Detection"
                    fill="#eab308"
                    radius={[4, 4, 0, 0]}
                    barSize={8}
                  />
                  <Bar
                    dataKey="thermal"
                    name="Thermal Indicators Detection"
                    fill="#14b8a6"
                    radius={[4, 4, 0, 0]}
                    barSize={8}
                  />
                  <Bar
                    dataKey="aggression"
                    name="Aggression Detection"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    barSize={8}
                  />
                  <Bar
                    dataKey="intrusion"
                    name="Intrusion Detection"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    barSize={8}
                  />
                  <Bar
                    dataKey="fall"
                    name="Fall Detection"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    barSize={8}
                  />
                  <Bar
                    dataKey="escape"
                    name="Escape Attempts Detection"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                    barSize={8}
                  />
                  <Bar
                    dataKey="staff"
                    name="Staff Detection"
                    fill="#22d3ee"
                    radius={[4, 4, 0, 0]}
                    barSize={8}
                  />
                  <Bar
                    dataKey="tussle"
                    name="Tussle Detection"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                    barSize={8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Recent Events */}
            <RecentEvents
              className="lg:col-span-2"
              maxDisplayCount={4}
              showHeader={true}
              enablePopup={true}
            />

            {/* Camera Status */}
            <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Camera Status
                  </h3>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {cameraStatus.filter((c) => c.status === "online").length}/
                  {cameraStatus.length} online
                </span>
              </div>

              <div className="space-y-3">
                {cameraStatus.map((camera) => (
                  <div
                    key={camera.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          camera.status === "online"
                            ? "bg-cyan-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {camera.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {camera.detections} detections
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
