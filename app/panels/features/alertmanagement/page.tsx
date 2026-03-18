"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Sparkles,
  Eye,
  Activity,
  UserCheck,
  AlertTriangle,
  X,
  Clock,
  Camera,
  MapPin,
  Trash2,
} from "lucide-react";
import {
  storeNotifications,
  getStoredNotifications,
  DashboardNotification,
} from "@/lib/videoNotifications";

interface AlertDetail {
  id: string;
  timestamp: string;
  camera: string;
  location: string;
  description: string;
  imageUrl: string;
}

interface FeatureAlert {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  alertCount: number;
  color: string;
  lastAlert: string;
  recentAlerts: AlertDetail[];
}

export default function AlertsPage() {
  const [selectedFeature, setSelectedFeature] = useState<FeatureAlert | null>(
    null,
  );

  // Push notifications state
  const [pushNotifications, setPushNotifications] = useState<
    DashboardNotification[]
  >([]);

  // Load initial notifications
  useEffect(() => {
    const loadNotifications = () => {
      const notifications = getStoredNotifications();
      setPushNotifications(notifications);
    };

    loadNotifications();

    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const [featureAlerts] = useState<FeatureAlert[]>([
    {
      id: "pacing-detection",
      name: "Pacing",
      description: "Repeated pacing behavior detected in monitored zones",
      icon: <Activity className="w-5 h-5" />,
      alertCount: 6,
      color: "cyan",
      lastAlert: "4 min ago",
      recentAlerts: [
        {
          id: "pc-1",
          timestamp: "4 min ago",
          camera: "Camera 5 - East Corridor",
          location: "Building A - First Floor",
          description:
            "Continuous pacing pattern detected for over 3 minutes near patient room entrances.",
          imageUrl: "/placeholder-alert-1.jpg",
        },
      ],
    },
    {
      id: "erratic-movements-detection",
      name: "Erratic Movements",
      description: "Sudden or irregular movement patterns were detected",
      icon: <Activity className="w-5 h-5" />,
      alertCount: 3,
      color: "purple",
      lastAlert: "7 min ago",
      recentAlerts: [
        {
          id: "em-1",
          timestamp: "7 min ago",
          camera: "Camera 2 - Recreation Area",
          location: "Building B - Common Hall",
          description:
            "Erratic movement pattern detected with frequent directional changes and unstable gait.",
          imageUrl: "/placeholder-alert-2.jpg",
        },
      ],
    },
    {
      id: "arm-flailing-detection",
      name: "Arm Flailing",
      description: "Rapid arm flailing motion detected",
      icon: <AlertTriangle className="w-5 h-5" />,
      alertCount: 7,
      color: "amber",
      lastAlert: "3 min ago",
      recentAlerts: [
        {
          id: "af-1",
          timestamp: "3 min ago",
          camera: "Camera 8 - Therapy Room",
          location: "Building A - Ground Floor",
          description:
            "High-frequency arm flailing detected; staff notified for behavioral support.",
          imageUrl: "/placeholder-alert-3.jpg",
        },
      ],
    },
    {
      id: "facial-expressions-detection",
      name: "Facial Expressions",
      description: "Distress-related facial cues detected",
      icon: <Eye className="w-5 h-5" />,
      alertCount: 4,
      color: "yellow",
      lastAlert: "9 min ago",
      recentAlerts: [
        {
          id: "fx-1",
          timestamp: "9 min ago",
          camera: "Camera 6 - Dining Area",
          location: "Building A - Main Wing",
          description:
            "Facial distress indicators detected with sustained discomfort expression.",
          imageUrl: "/placeholder-alert-4.jpg",
        },
      ],
    },
    {
      id: "thermal-indicators-detection",
      name: "Thermal Indicators",
      description: "Temperature-based anomaly detected",
      icon: <Sparkles className="w-5 h-5" />,
      alertCount: 2,
      color: "teal",
      lastAlert: "12 min ago",
      recentAlerts: [
        {
          id: "th-1",
          timestamp: "12 min ago",
          camera: "Thermal Camera 1 - Exit Hall",
          location: "Building C - South Wing",
          description:
            "Localized thermal spike detected near doorway; area flagged for review.",
          imageUrl: "/placeholder-alert-1.jpg",
        },
      ],
    },
    {
      id: "aggression-detection",
      name: "Aggression",
      description: "Aggressive behavior patterns detected",
      icon: <AlertTriangle className="w-5 h-5" />,
      alertCount: 3,
      color: "rose",
      lastAlert: "6 min ago",
      recentAlerts: [
        {
          id: "ag-1",
          timestamp: "6 min ago",
          camera: "Camera 3 - Activity Hall",
          location: "Building B - Ground Floor",
          description:
            "Escalating aggressive gestures detected between two individuals.",
          imageUrl: "/placeholder-alert-2.jpg",
        },
      ],
    },
    {
      id: "intrusion-detection",
      name: "Intrusion",
      description: "Unauthorized entry or restricted-area access detected",
      icon: <Bell className="w-5 h-5" />,
      alertCount: 2,
      color: "indigo",
      lastAlert: "14 min ago",
      recentAlerts: [
        {
          id: "in-1",
          timestamp: "14 min ago",
          camera: "Camera 10 - Rear Exit",
          location: "Perimeter - West Gate",
          description:
            "Intrusion event detected at a restricted access point outside visiting hours.",
          imageUrl: "/placeholder-alert-3.jpg",
        },
      ],
    },
    {
      id: "fall-detection",
      name: "Fall",
      description: "Alerts triggered when a fall is detected",
      icon: <AlertTriangle className="w-5 h-5" />,
      alertCount: 10,
      color: "red",
      lastAlert: "2 min ago",
      recentAlerts: [
        {
          id: "fd-1",
          timestamp: "2 min ago",
          camera: "Camera 1 - Main Lobby",
          location: "Building A - Ground Floor",
          description:
            "Person fall detected in the lobby area. Individual appears to have slipped. Staff has been notified for immediate assistance.",
          imageUrl: "/placeholder-alert-1.jpg",
        },
      ],
    },
    {
      id: "escape-attempts-detection",
      name: "Escape Attempts",
      description:
        "Potential unauthorized exits or wandering attempts detected",
      icon: <AlertTriangle className="w-5 h-5" />,
      alertCount: 1,
      color: "orange",
      lastAlert: "16 min ago",
      recentAlerts: [
        {
          id: "ea-1",
          timestamp: "16 min ago",
          camera: "Camera 11 - North Gate",
          location: "Building A - Exit Zone",
          description:
            "Resident movement pattern indicates repeated attempts toward restricted exit.",
          imageUrl: "/placeholder-alert-4.jpg",
        },
      ],
    },
    {
      id: "staff-detection",
      name: "Staff",
      description: "Staff presence and activity detection",
      icon: <UserCheck className="w-5 h-5" />,
      alertCount: 5,
      color: "sky",
      lastAlert: "5 min ago",
      recentAlerts: [
        {
          id: "st-1",
          timestamp: "5 min ago",
          camera: "Camera 7 - Medication Room",
          location: "Building A - Clinical Wing",
          description:
            "Authorized staff member detected in medication handling zone.",
          imageUrl: "/placeholder-alert-1.jpg",
        },
      ],
    },
    {
      id: "tussle-detection",
      name: "Tussle",
      description: "Alerts triggered when physical altercations are detected",
      icon: <Activity className="w-5 h-5" />,
      alertCount: 8,
      color: "orange",
      lastAlert: "2 min ago",
      recentAlerts: [
        {
          id: "fgt-1",
          timestamp: "2 min ago",
          camera: "Camera 2 - Parking Lot",
          location: "Building A - Parking Area",
          description:
            "Physical altercation detected between two individuals in the parking lot. Security has been dispatched to de-escalate the situation.",
          imageUrl: "/placeholder-alert-4.jpg",
        },
      ],
    },
  ]);

  const getColorClasses = (color: string) => {
    // Use unified blue styling for all alert cards
    return {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      icon: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-700",
      badge: "bg-blue-600",
      header: "from-blue-600 to-blue-700",
    };
  };

  const totalAlerts = featureAlerts.reduce((sum, f) => sum + f.alertCount, 0);

  // Clear all push notifications
  const clearAllNotifications = () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      storeNotifications([]);
      setPushNotifications([]);
    }
  };

  // Clear single notification
  const clearNotification = (index: number) => {
    const current = getStoredNotifications();
    const updated = [...current];
    updated.splice(index, 1);
    storeNotifications(updated);
    setPushNotifications(updated);
  };

  const getNotificationTitle = (type: string) =>
    `${type.charAt(0).toUpperCase()}${type.slice(1)} Detection`;

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Hero Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
              Alert Settings
            </h1>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 ml-15">
          Configure how you want to receive real-time authentication
          notifications
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Stay Connected
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Get instant notifications when employees check in or out, helping
              you monitor attendance in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Push Notifications Section */}
      {pushNotifications.length > 0 && (
        <div className="bg-white-50 dark:bg-blue-900/30 rounded-2xl borde dark:border-blue-700 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Push Notifications
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time alert notifications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {pushNotifications.length}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  Active
                </p>
              </div>
              <button
                onClick={clearAllNotifications}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pushNotifications.slice(0, 10).map((notification, index) => (
              <div
                key={index}
                className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          {getNotificationTitle(notification.type)}
                        </h4>
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                          {notification.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {notification.camera && (
                          <div className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>{notification.camera}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => clearNotification(index)}
                      className="p-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pushNotifications.length > 10 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing 10 of {pushNotifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}

      {/* Feature Alerts Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Feature Alerts
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Alert counts by detection feature
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {totalAlerts}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total Alerts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featureAlerts.map((feature) => {
            const colors = getColorClasses(feature.color);
            return (
              <div
                key={feature.id}
                onClick={() => setSelectedFeature(feature)}
                className={`p-4 rounded-xl border ${colors.border} ${colors.bg} transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm`}
                  >
                    <span className={colors.icon}>{feature.icon}</span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full ${colors.badge} text-white text-sm font-bold`}
                  >
                    {feature.alertCount}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                  {feature.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Last alert: {feature.lastAlert}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div
              className={`bg-gradient-to-r ${
                getColorClasses(selectedFeature.color).header
              } p-6`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-white">{selectedFeature.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedFeature.name}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {selectedFeature.alertCount} alerts • Last:{" "}
                      {selectedFeature.lastAlert}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Recent Alerts
              </h3>
              <div className="space-y-4">
                {selectedFeature.recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Alert Image */}
                      <div className="md:w-64 h-48 md:h-auto bg-gray-900 dark:bg-slate-900 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <div className="text-center">
                            <Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">
                              Alert Snapshot
                            </p>
                          </div>
                        </div>
                        {/* Timestamp overlay */}
                        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                          {alert.timestamp}
                        </div>
                      </div>

                      {/* Alert Details */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{alert.timestamp}</span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getColorClasses(selectedFeature.color).badge
                            } text-white`}
                          >
                            Alert
                          </span>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Camera className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium text-gray-800 dark:text-white">
                              {alert.camera}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {alert.location}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {alert.description}
                        </p>

                        <div className="mt-4 flex gap-2">
                          <button className="px-3 py-1.5 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">
                            View Full Image
                          </button>
                          <button className="px-3 py-1.5 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">
                            Mark as Reviewed
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Channel selection removed: WhatsApp and Telegram options are no longer available */}

      {/* Help Section */}
      <div className="mt-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
          Need Help?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Having trouble setting up alerts? Contact our support team.
        </p>
      </div>
    </div>
  );
}
