"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Video,
  Eye,
  Activity,
  AlertTriangle,
  HardDrive,
  TrendingUp,
  Camera,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Profile, CameraConfig } from "@/types";
import CameraFeed from "@/components/CameraFeed";
import RecentEvents from "@/components/RecentEvents";

import {
  videoTimestamps,
  pushNotification,
  VideoNotification,
} from "@/lib/videoNotifications";

const metrics = [
  {
    title: "Active Video Feeds",
    value: "5/5",
    change: "+1 today",
    icon: Video,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-900/30",
  },
  {
    title: "Total Detections",
    value: "46",
    change: "+3 today",
    icon: Eye,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-900/30",
  },
  {
    title: "Active Events",
    value: "6",
    change: "2 critical",
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/30",
  },
  {
    title: "Storage Used",
    value: "2.4 GB",
    change: "68% capacity",
    icon: HardDrive,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-900/30",
  },
];

const detectionData = [
  { name: "Pacing", value: 12, color: "#06b6d4" },
  { name: "Erratic Movements", value: 7, color: "#a21caf" },
  { name: "Arm Flailing", value: 15, color: "#f59e42" },
  { name: "Facial Expressions", value: 9, color: "#eab308" },
  { name: "Thermal Indicators", value: 5, color: "#14b8a6" },
  { name: "Aggression", value: 8, color: "#f43f5e" },
  { name: "Intrusion", value: 4, color: "#6366f1" },
  { name: "Fall", value: 39, color: "#ef4444" },
  { name: "Escape Attempts", value: 3, color: "#f97316" },
  { name: "Staff", value: 18, color: "#22d3ee" },
  { name: "Tussle", value: 31, color: "#f97316" },
];

const hourlyActivity = [
  { hour: "00:00", detections: 3 },
  { hour: "03:00", detections: 2 },
  { hour: "06:00", detections: 1 },
  { hour: "09:00", detections: 0 },
  { hour: "12:00", detections: 0 },
  { hour: "15:00", detections: 0 },
  { hour: "18:00", detections: 1 },
  { hour: "21:00", detections: 0 },
];

type PieLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  name?: string;
  value?: number | string;
};

type DisplayCamera = {
  id: number | string;
  name: string;
  url?: string;
  status: string;
  detection: boolean;
  alert_sound: boolean;
  frame_rate: number;
  resolution: string;
  organization_id: string | number;
  updated_at: string;
  isPhysical?: boolean;
  isVideo?: boolean;
  device_id?: string;
};

function renderCustomizedLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  value,
}: PieLabelProps) {
  if (
    cx == null ||
    cy == null ||
    midAngle == null ||
    outerRadius == null ||
    name == null ||
    value == null
  ) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#333"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
      style={{ pointerEvents: "none" }}
    >
      {`${name}: ${value}`}
    </text>
  );
}

export default function VideoAnalyticsPage() {
  const router = useRouter();
  const [selectedCamera, setSelectedCamera] = useState<
    number | string | undefined
  >(() => {
    try {
      if (typeof window === "undefined") return undefined;
      const saved = localStorage.getItem("videoAnalytics:selectedCamera");
      if (!saved) return undefined;
      const parsed = Number(saved);
      return Number.isNaN(parsed) ? undefined : parsed;
    } catch {
      return undefined;
    }
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cameras] = useState<CameraConfig[]>([]);
  const [physicalCameras, setPhysicalCameras] = useState<MediaDeviceInfo[]>([]);
  const [, setIsDetecting] = useState(false);

  // Persist selection
  useEffect(() => {
    try {
      if (selectedCamera != null) {
        localStorage.setItem(
          "videoAnalytics:selectedCamera",
          String(selectedCamera),
        );
      }
    } catch {
      // ignore
    }
  }, [selectedCamera]);

  // Webcam Preview Component
  const WebcamPreview = ({
    deviceId,
    className = "",
  }: {
    deviceId: string;
    className?: string;
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let isMounted = true;
      let currentStream: MediaStream | null = null;

      const startWebcam = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
            audio: false,
          });
          currentStream = mediaStream;

          if (isMounted && videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            setError(null);
          } else {
            mediaStream.getTracks().forEach((track) => track.stop());
          }
        } catch (err) {
          if (isMounted) {
            setError("Failed to access camera");
            console.error("Webcam error:", err);
          }
        }
      };

      startWebcam();

      return () => {
        isMounted = false;
        if (currentStream) {
          currentStream.getTracks().forEach((track) => track.stop());
        }
      };
    }, [deviceId]);

    if (error) {
      return (
        <div
          className={`flex flex-col items-center justify-center text-gray-400 ${className}`}
        >
          <Camera className="w-8 h-8 mb-2" />
          <span className="text-xs text-center">{error}</span>
        </div>
      );
    }

    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${className}`}
      />
    );
  };

  // Video Preview Component for hardcoded videos with notification support
  const VideoPreview = ({
    videoSrc,
    className = "",
    autoPlay = true,
    disableMouse = true,
    controls = false,
    enableNotifications = false,
    fit = "cover",
  }: {
    videoSrc: string;
    className?: string;
    autoPlay?: boolean;
    disableMouse?: boolean;
    controls?: boolean;
    enableNotifications?: boolean;
    fit?: "cover" | "contain";
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const triggeredNotificationsRef = useRef<Set<string>>(new Set());
    const lastTimeRef = useRef<number>(0);

    // Handle time update to check for notifications
    const handleTimeUpdate = useCallback(() => {
      if (!enableNotifications || !videoRef.current) return;

      const currentTime = videoRef.current.currentTime;
      const timestamps = videoTimestamps[videoSrc] || [];

      // Check if video was seeked backwards (reset triggered notifications)
      if (currentTime < lastTimeRef.current - 1) {
        triggeredNotificationsRef.current.clear();
      }
      lastTimeRef.current = currentTime;

      // Check each timestamp
      timestamps.forEach((notification: VideoNotification) => {
        const notificationKey = `${notification.id}-${videoSrc}`;

        // Trigger if we're within 0.5 seconds of the timestamp and haven't triggered yet
        if (
          currentTime >= notification.timestamp &&
          currentTime <= notification.timestamp + 0.5 &&
          !triggeredNotificationsRef.current.has(notificationKey)
        ) {
          triggeredNotificationsRef.current.add(notificationKey);
          pushNotification(notification);

          // Play alert sound if enabled
          if (typeof window !== "undefined") {
            try {
              const audio = new Audio("/sounds/alert.mp3");
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch {}
          }
        }
      });
    }, [videoSrc, enableNotifications]);

    // Reset triggered notifications when video source changes
    useEffect(() => {
      triggeredNotificationsRef.current.clear();
      lastTimeRef.current = 0;
    }, [videoSrc]);

    // Handle video play - reset notifications when video starts from beginning
    const handlePlay = useCallback(() => {
      if (videoRef.current && videoRef.current.currentTime < 1) {
        triggeredNotificationsRef.current.clear();
      }
    }, []);

    if (!videoSrc) {
      return (
        <div
          className={`flex flex-col items-center justify-center text-gray-400 ${className}`}
        >
          <Camera className="w-8 h-8 mb-2" />
          <span className="text-xs text-center">No video source</span>
        </div>
      );
    }

    return (
      <video
        ref={videoRef}
        src={videoSrc}
        className={`w-full h-full ${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
        autoPlay={autoPlay}
        muted
        loop
        playsInline
        controls={controls}
        style={disableMouse ? { pointerEvents: "none" } : {}}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
      />
    );
  };

  // Fetch user profile
  useEffect(() => {
    const fetchUserAndProfile = async () => {
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
      setProfile(profile);
    };
    fetchUserAndProfile();
  }, [router]);

  // Remove database camera fetching. Only use static/mock cameras, physical cameras, and hardcoded videos.
  useEffect(() => {
    // Auto-detect physical cameras on page load
    if (navigator.mediaDevices) {
      detectPhysicalCameras();
    }
  }, []);

  // Combine database cameras with physical cameras and hardcoded videos for display
  function getAllCameras(): DisplayCamera[] {
    const dbCameras: DisplayCamera[] = cameras.map((cam) => ({
      id: cam.id,
      name: cam.name,
      url: cam.url,
      status: cam.status || "normal",
      detection: cam.detection ?? true,
      alert_sound: cam.alert_sound ?? true,
      frame_rate: cam.frame_rate ?? 30,
      resolution: cam.resolution || "1080p",
      organization_id: cam.organization_id ?? profile?.organization_id ?? 0,
      updated_at: cam.updated_at || new Date().toISOString(),
    }));

    const physicalCamsFormatted = physicalCameras.map((device, index) => ({
      id: `physical_${device.deviceId}`,
      name: `test${index + 1}`,
      url: `webcam://${device.deviceId}`,
      status: "normal" as const,
      detection: true,
      alert_sound: true,
      frame_rate: 30,
      resolution: "1080p" as const,
      device_id: device.deviceId,
      isPhysical: true,
      organization_id: profile?.organization_id || 0,
      updated_at: new Date().toISOString(),
    }));

    const hardcodedVideos = [
      {
        id: "video_1",
        name: "Camera 1",
        url: "/videos/Fall.mp4",
        status: "normal" as const,
        detection: true,
        alert_sound: true,
        frame_rate: 30,
        resolution: "1080p" as const,
        isVideo: true,
        organization_id: profile?.organization_id || 0,
        updated_at: new Date().toISOString(),
      },
      {
        id: "video_2",
        name: "Camera 2",
        url: "/videos/Tussle 1.mp4",
        status: "normal" as const,
        detection: true,
        alert_sound: true,
        frame_rate: 30,
        resolution: "1080p" as const,
        isVideo: true,
        organization_id: profile?.organization_id || 0,
        updated_at: new Date().toISOString(),
      },
      {
        id: "video_3",
        name: "Camera 3",
        url: "/videos/fall 1.mp4",
        status: "normal" as const,
        detection: true,
        alert_sound: true,
        frame_rate: 30,
        resolution: "1080p" as const,
        isVideo: true,
        organization_id: profile?.organization_id || 0,
        updated_at: new Date().toISOString(),
      },
      {
        id: "video_4",
        name: "Camera 4",
        url: "/videos/Escaping from building.mp4",
        status: "normal" as const,
        detection: true,
        alert_sound: true,
        frame_rate: 30,
        resolution: "1080p" as const,
        isVideo: true,
        organization_id: profile?.organization_id || 0,
        updated_at: new Date().toISOString(),
      },
      {
        id: "video_5",
        name: "Camera 5",
        url: "/videos/Perimeter control.mp4",
        status: "normal" as const,
        detection: true,
        alert_sound: true,
        frame_rate: 30,
        resolution: "1080p" as const,
        isVideo: true,
        organization_id: profile?.organization_id || 0,
        updated_at: new Date().toISOString(),
      },
    ];

    return [...dbCameras, ...physicalCamsFormatted, ...hardcodedVideos];
  }

  // Physical camera detection function
  const detectPhysicalCameras = async () => {
    setIsDetecting(true);
    try {
      // Request permission to access cameras first
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach((track) => track.stop());

      // Now enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      // Just store in state, don't add to database
      setPhysicalCameras(videoDevices);
    } catch (error) {
      console.error("Error detecting cameras:", error);
    } finally {
      setIsDetecting(false);
    }
  };

  // Get selected camera
  const getSelectedCamera = () => {
    return getAllCameras().find((c) => c.id === selectedCamera);
  };

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            Video Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time detection monitoring
          </p>
        </div>

        {/* <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </button>
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div> */}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.title}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${metric.bg}`}
              >
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {metric.title}
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              {metric.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {metric.change}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Video Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Video Player */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Live Feed - {getSelectedCamera()?.name || "No Camera"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getSelectedCamera()
                    ? `Camera ${selectedCamera} • Real-time monitoring`
                    : "Select a camera to view"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  LIVE
                </span>
              </div>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4">
              {getAllCameras().length === 0 ? (
                <div className="flex flex-col items-center justify-center text-gray-400 h-full">
                  <Camera className="w-12 h-12 mb-3" />
                  <span className="text-sm">No cameras available</span>
                </div>
              ) : (
                getAllCameras().map((camera) => (
                  <div
                    key={camera.id}
                    className={`absolute inset-0 transition-opacity duration-150 ${
                      selectedCamera === camera.id
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                    aria-hidden={selectedCamera !== camera.id}
                  >
                    {camera.isPhysical ? (
                      <WebcamPreview
                        deviceId={camera.device_id!}
                        className="w-full h-full"
                      />
                    ) : camera.isVideo ? (
                      <VideoPreview
                        videoSrc={camera.url || ""}
                        className="w-full h-full"
                        autoPlay={true}
                        controls={camera.id === selectedCamera}
                        disableMouse={camera.id !== selectedCamera}
                        enableNotifications={selectedCamera === camera.id}
                        fit={
                          camera.id === "video_3" || camera.name === "Camera 3"
                            ? "contain"
                            : "cover"
                        }
                      />
                    ) : (
                      <CameraFeed
                        camera={camera}
                        orgDisplayId={profile?.organizations?.displayid}
                      />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Video Controls */}
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {isPlaying ? "Playing" : "Paused"}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Activity className="w-4 h-4" />
                <span>
                  {cameras.length} camera{cameras.length !== 1 ? "s" : ""}{" "}
                  connected
                </span>
              </div>
            </div> */}
          </div>

          {/* Camera Grid */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              All Cameras ({getAllCameras().length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getAllCameras().map((camera) => (
                <div
                  key={camera.id}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                    selectedCamera === camera.id
                      ? "border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-200 dark:ring-cyan-800"
                      : "border-gray-200 dark:border-slate-600 hover:border-cyan-300 dark:hover:border-cyan-600"
                  }`}
                >
                  {/* Camera Preview Thumbnail */}
                  <button
                    onClick={() => setSelectedCamera(camera.id)}
                    className="w-full aspect-video bg-gray-900 dark:bg-slate-950 flex items-center justify-center overflow-hidden"
                  >
                    {camera.isPhysical ? (
                      <WebcamPreview
                        deviceId={camera.device_id!}
                        className="w-full h-full"
                      />
                    ) : camera.isVideo ? (
                      <VideoPreview
                        videoSrc={camera.url || ""}
                        className="w-full h-full"
                        autoPlay={false}
                        controls={false}
                        disableMouse
                        fit={
                          camera.id === "video_3" || camera.name === "Camera 3"
                            ? "contain"
                            : "cover"
                        }
                      />
                    ) : (
                      <CameraFeed
                        camera={camera}
                        orgDisplayId={profile?.organizations?.displayid}
                      />
                    )}
                  </button>

                  {/* Camera Info */}
                  <div className="p-3 bg-white dark:bg-slate-800 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                        {camera.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {camera.isPhysical ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
                            Physical
                          </span>
                        ) : camera.isVideo ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                            Video
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-medium">
                            Database
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedCamera === camera.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Detection by Type */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Detection by Type
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Today&apos;s distribution
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-cyan-600" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={detectionData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={renderCustomizedLabel}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {detectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Hourly Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Hourly Activity
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Detection trends
                  </p>
                </div>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourlyActivity}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="hour"
                    stroke="#9ca3af"
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="detections"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Recent Events */}
        <div className="space-y-6">
          {/* Recent Events */}
          <RecentEvents
            maxDisplayCount={6}
            showHeader={true}
            enablePopup={false}
            className=""
          />

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Today&apos;s Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Total Events</span>
                <span className="text-xl font-bold">62</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Critical Alerts</span>
                <span className="text-xl font-bold">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Avg Response</span>
                <span className="text-xl font-bold">1.2s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Accuracy</span>
                <span className="text-xl font-bold">98.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
