// Video notification system for demo purposes
// Defines timestamps for each video that trigger notifications

export interface VideoNotification {
  id: string;
  timestamp: number; // in seconds
  type: string;
  message: string;
  camera: string;
  location: string;
  severity: "critical" | "high" | "medium" | "low";
}

export interface DashboardNotification {
  id: string;
  type: string;
  message: string;
  camera: string;
  location: string;
  severity: "critical" | "high" | "medium" | "low";
  time: string;
  timestamp: number;
  read: boolean;
}

// Define timestamps for each video with notification data
export const videoTimestamps: Record<string, VideoNotification[]> = {
  // Video 1 - Fall.mp4
  "/videos/Fall.mp4": [
    {
      id: "fall-1-1",
      timestamp: 4,
      type: "fall",
      message: "Fall detected",
      camera: "Cam 1 - Main Lobby",
      location: "Building A - Ground Floor",
      severity: "critical",
    },
    {
      id: "fall-1-2",
      timestamp: 10,
      type: "fall",
      message: "Person down - immediate attention required",
      camera: "Cam 1 - Main Lobby",
      location: "Building A - Ground Floor",
      severity: "high",
    },
    {
      id: "fall-1-3",
      timestamp: 16,
      type: "fall",
      message: "Person down - immediate attention required",
      camera: "Cam 1 - car park",
      location: "car park - Zone D",
      severity: "high",
    },
    {
      id: "fall-1-4",
      timestamp: 24,
      type: "fall",
      message: "Person down",
      camera: "Cam 1 - car park",
      location: "car park - Zone A",
      severity: "high",
    },
    {
      id: "fall-1-5",
      timestamp: 33,
      type: "fall",
      message: "Person down - immediate attention required",
      camera: "Cam 1 - Lot Entrance",
      location: "Lot Entrance",
      severity: "high",
    },
    {
      id: "fall-1-6",
      timestamp: 39,
      type: "fall",
      message: "Person down - immediate attention required",
      camera: "Cam 1",
      location: "stair case - Floor 3",
      severity: "low",
    },
    {
      id: "fall-1-7",
      timestamp: 48,
      type: "fall",
      message: "Person down - immediate attention required",
      camera: "Cam 1",
      location: "Lobby A",
      severity: "low",
    },
  ],
  
  // Video 2 - Tussle 1.mp4
  "/videos/Tussle 1.mp4": [
    {
      id: "tussle-2-1",
      timestamp: 3,
      type: "tussle",
      message: "Tussle detected",
      camera: "Cam 2 ",
      location: "Building A - Cafe",
      severity: "critical",
    },
    {
      id: "tussle-2-2",
      timestamp: 9,
      type: "tussle",
      message: "Tussle detected",
      camera: "Cam 2 ",
      location: "Building A - Cafe",
      severity: "critical",
    },
    {
      id: "tussle-2-3",
      timestamp: 18,
      type: "tussle",
      message: "Tussle detected",
      camera: "Cam 2 ",
      location: "Building A - Cafe",
      severity: "critical",
    },
    {
      id: "tussle-2-4",
      timestamp: 25,
      type: "tussle",
      message: "Tussle detected",
      camera: "Cam 2 ",
      location: "Building A - Cafe",
      severity: "critical",
    },
    {
      id: "tussle-2-5",
      timestamp: 35,
      type: "tussle",
      message: "Tussle detected",
      camera: "Cam 2 ",
      location: "Building A - Cafe",
      severity: "critical",
    },
  ],
  
  // Video 3 - fall 1.mp4
  "/videos/fall 1.mp4": [
    {
      id: "fall-3-1",
      timestamp: 2,
      type: "fall",
      message: "Fall detected in Corridor B",
      camera: "Cam 3 - Corridor B",
      location: "Building A - First Floor",
      severity: "critical",
    },
    {
      id: "fall-3-2",
      timestamp: 5,
      type: "fall",
      message: "person fall - medical assistance needed",
      camera: "Cam 3 - Corridor B",
      location: "Building A - First Floor",
      severity: "critical",
    },
    {
      id: "fall-3-3",
      timestamp: 9,
      type: "fall",
      message: "Person attempting to get up",
      camera: "Cam 3 - Corridor B",
      location: "Building A - First Floor",
      severity: "medium",
    },
  ],

  "/videos/Escaping from building.mp4": [
    {
      id: "fall-4-1",
      timestamp: 4,
      type: "escaping",
      message: "Person escaping from building",
      camera: "Cam 4",
      location: "Building A - Ground Floor",
      severity: "critical",
    },
    {
      id: "fall-4-2",
      timestamp: 10,
      type: "escaping",
      message: "Person escaping from building",
      camera: "Cam 4",
      location: "Building A - Ground Floor",
      severity: "critical",
    },
    {
      id: "fall-4-3",
      timestamp: 22,
      type: "escaping",
      message: "Person down",
      camera: "Cam 4",
      location: "Building A - Ground Floor",
      severity: "high",
    },
  ],

  "/videos/Perimeter control.mp4": [
    {
      id: "fall-5-1",
      timestamp: 4,
      type: "perimeter",
      message: "Perimeter breach detected",
      camera: "Cam 5 - Perimeter",
      location: "Building A - Perimeter",
      severity: "critical",
    },
    {
      id: "fall-5-2",
      timestamp: 12,
      type: "perimeter",
      message: "Perimeter breach detected",
      camera: "Cam 5 - Perimeter",
      location: "Building A - Perimeter",
      severity: "critical",
    },
  ]
};

// Notification event system
const NOTIFICATION_EVENT = "video-notification";
const STORAGE_KEY = "dashboard-notifications";

// Get stored notifications
export function getStoredNotifications(): DashboardNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Store notifications
export function storeNotifications(notifications: DashboardNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    // Keep only last 50 notifications
    const toStore = notifications.slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // ignore
  }
}

// Push a new notification
export function pushNotification(notification: VideoNotification): void {
  const dashboardNotification: DashboardNotification = {
    id: `${notification.id}-${Date.now()}`,
    type: notification.type,
    message: notification.message,
    camera: notification.camera,
    location: notification.location,
    severity: notification.severity,
    time: "Just now",
    timestamp: Date.now(),
    read: false,
  };

  // Add to storage
  const existing = getStoredNotifications();
  existing.push(dashboardNotification);
  storeNotifications(existing);

  // Dispatch custom event for real-time updates
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(NOTIFICATION_EVENT, {
        detail: dashboardNotification,
      })
    );
  }
}

// Subscribe to notifications
export function subscribeToNotifications(
  callback: (notification: DashboardNotification) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: CustomEvent<DashboardNotification>) => {
    callback(event.detail);
  };

  window.addEventListener(NOTIFICATION_EVENT as any, handler);

  return () => {
    window.removeEventListener(NOTIFICATION_EVENT as any, handler);
  };
}

// Clear all notifications
export function clearNotifications(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("notifications-cleared"));
}

// Mark notification as read
export function markAsRead(notificationId: string): void {
  const notifications = getStoredNotifications();
  const updated = notifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  storeNotifications(updated);
}

// Mark all as read
export function markAllAsRead(): void {
  const notifications = getStoredNotifications();
  const updated = notifications.map((n) => ({ ...n, read: true }));
  storeNotifications(updated);
}

// Get unread count
export function getUnreadCount(): number {
  return getStoredNotifications().filter((n) => !n.read).length;
}

// Format time ago
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 120) return "1 min ago";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 7200) return "1 hour ago";
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
