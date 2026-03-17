"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Activity, Bell, X } from "lucide-react";
import {
  subscribeToNotifications,
  getStoredNotifications,
  formatTimeAgo,
  clearNotifications,
  DashboardNotification,
} from "@/lib/videoNotifications";

// Static alerts for fallback
const staticAlerts = [
  {
    id: 1,
    type: "Fall Detection",
    message: "Fall detected in Main Entrance",
    camera: "Cam 1",
    time: "5 min ago",
    severity: "high",
    icon: AlertTriangle,
  },
  {
    id: 2,
    type: "Tussle Detection",
    message: "Tussle detected in Parking Lot",
    camera: "Cam 4",
    time: "8 min ago",
    severity: "medium",
    icon: Activity,
  },
  {
    id: 3,
    type: "Arm Flailing Detection",
    message: "Arm flailing detected in Corridor B",
    camera: "Cam 2",
    time: "15 min ago",
    severity: "high",
    icon: AlertTriangle,
  },
  {
    id: 4,
    type: "Pacing Detection",
    message: "Pacing pattern detected near Reception",
    camera: "Cam 3",
    time: "32 min ago",
    severity: "medium",
    icon: Activity,
  },
  {
    id: 5,
    type: "Erratic Movements Detection",
    message: "Erratic movement detected in Activity Hall",
    camera: "Cam 5",
    time: "38 min ago",
    severity: "high",
    icon: AlertTriangle,
  },
  {
    id: 6,
    type: "Facial Expressions Detection",
    message: "Distress facial expression detected in Dining Area",
    camera: "Cam 3",
    time: "44 min ago",
    severity: "medium",
    icon: Activity,
  },
  {
    id: 7,
    type: "Thermal Indicators Detection",
    message: "Thermal anomaly detected in Room 12",
    camera: "Cam 4",
    time: "51 min ago",
    severity: "low",
    icon: Activity,
  },
  {
    id: 8,
    type: "Aggression Detection",
    message: "Aggressive behavior detected in Common Area",
    camera: "Cam 1",
    time: "1 hr ago",
    severity: "high",
    icon: AlertTriangle,
  },
  {
    id: 9,
    type: "Intrusion Detection",
    message: "Unauthorized entry detected at Rear Exit",
    camera: "Cam 1",
    time: "1 hr ago",
    severity: "high",
    icon: AlertTriangle,
  },
  {
    id: 10,
    type: "Escape Attempts Detection",
    message: "Escape attempt detected near Gate B",
    camera: "Cam 2",
    time: "1 hr ago",
    severity: "high",
    icon: AlertTriangle,
  },
  {
    id: 11,
    type: "Staff Detection",
    message: "Staff activity detected in Medication Room",
    camera: "Cam 1",
    time: "2 hrs ago",
    severity: "low",
    icon: Activity,
  },
];

interface RecentEventsProps {
  maxDisplayCount?: number;
  showHeader?: boolean;
  enablePopup?: boolean;
  className?: string;
}

export default function RecentEvents({
  maxDisplayCount = 4,
  showHeader = true,
  enablePopup = true,
  className = "",
}: RecentEventsProps) {
  const [liveNotifications, setLiveNotifications] = useState<
    DashboardNotification[]
  >([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [latestNotification, setLatestNotification] =
    useState<DashboardNotification | null>(null);

  // Load stored notifications on mount
  useEffect(() => {
    const stored = getStoredNotifications();
    setLiveNotifications(stored.reverse()); // Most recent first
  }, []);

  // Subscribe to live notifications
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notification) => {
      setLiveNotifications((prev) => [notification, ...prev].slice(0, 50));
      setLatestNotification(notification);

      if (enablePopup) {
        setShowNotificationPopup(true);

        // Play notification sound
        try {
          const audio = new Audio("/sounds/alert.mp3");
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch {}

        // Auto-hide popup after 5 seconds
        setTimeout(() => {
          setShowNotificationPopup(false);
        }, 5000);
      }
    });

    return () => unsubscribe();
  }, [enablePopup]);

  // Update time displays periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveNotifications((prev) =>
        prev.map((n) => ({ ...n, time: formatTimeAgo(n.timestamp) })),
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Combine static alerts with live notifications for display
  const combinedAlerts =
    liveNotifications.length > 0
      ? liveNotifications.map((n, index) => ({
          id: n.id || index,
          type: n.type,
          message: n.message,
          camera: n.camera.split(" - ")[0] || n.camera,
          time: n.time || formatTimeAgo(n.timestamp),
          severity: n.severity === "critical" ? "high" : n.severity,
          icon: n.type === "fall" ? AlertTriangle : Activity,
        }))
      : staticAlerts;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      case "medium":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400";
      case "low":
        return "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400";
    }
  };

  const handleClearAll = () => {
    clearNotifications();
    setLiveNotifications([]);
  };

  return (
    <>
      <div
        className={`bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm ${className}`}
      >
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Recent Events
              </h3>
              {liveNotifications.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full animate-pulse">
                  {liveNotifications.filter((n) => !n.read).length} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {liveNotifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Clear All
                </button>
              )}
              {/* <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View All
              </button> */}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {combinedAlerts.slice(0, maxDisplayCount).map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSeverityColor(
                  alert.severity,
                )}`}
              >
                <alert.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {alert.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {alert.type} • {alert.camera}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(
                    alert.severity,
                  )}`}
                >
                  {alert.severity}
                </span>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {alert.time}
                </p>
              </div>
            </div>
          ))}
          {combinedAlerts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent events</p>
              <p className="text-xs mt-1">
                Events from video feeds will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Notification Popup */}
      {enablePopup && showNotificationPopup && latestNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div
            className={`px-4 py-3 rounded-t-xl ${
              latestNotification.severity === "critical"
                ? "bg-red-50 dark:bg-red-900/20"
                : latestNotification.severity === "high"
                  ? "bg-amber-50 dark:bg-amber-900/20"
                  : "bg-blue-50 dark:bg-blue-900/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {latestNotification.type === "fall" ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                  <Activity className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {latestNotification.type === "fall"
                    ? "Fall Detection"
                    : "Tussle Detection"}
                </span>
              </div>
              <button
                onClick={() => setShowNotificationPopup(false)}
                className="hover:bg-white/20 rounded p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">
              {latestNotification.message}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {latestNotification.camera}
            </p>
            <div className="flex items-center justify-between">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  latestNotification.severity === "critical"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : latestNotification.severity === "high"
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                }`}
              >
                {latestNotification.severity}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {latestNotification.time}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
