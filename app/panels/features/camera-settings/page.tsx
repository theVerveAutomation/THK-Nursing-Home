"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import io from "socket.io-client";
import {
  Camera,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Plus,
  X,
  Pencil,
  Trash2,
  Maximize2,
  Minimize2,
  Search,
  RefreshCw,
} from "lucide-react";
import { CameraConfig, Profile } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import CameraFeed from "@/components/CameraFeed";
import {
  videoTimestamps,
  pushNotification,
  VideoNotification,
} from "@/lib/videoNotifications";

export default function CameraSettingPage() {
  const router = useRouter();
  const socket = useMemo(
    () =>
      io(process.env.NEXT_PUBLIC_CLOUD_URL || "http://localhost:3001", {
        transports: ["websocket"],
        autoConnect: true,
      }),
    [],
  );

  const [cameras, setCameras] = useState<CameraConfig[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<number | undefined>(
    () => {
      try {
        if (typeof window === "undefined") return undefined;
        const saved = localStorage.getItem("cameraSettings:selectedCameraId");
        if (!saved) return undefined;
        const parsed = Number(saved);
        return Number.isNaN(parsed) ? undefined : parsed;
      } catch {
        return undefined;
      }
    },
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);
  const [newCameraUrl, setNewCameraUrl] = useState("");
  const [newCameraName, setNewCameraName] = useState("");
  const [editingCamera, setEditingCamera] = useState<CameraConfig | null>(null);
  const [editCameraName, setEditCameraName] = useState("");
  const [editCameraUrl, setEditCameraUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [physicalCameras, setPhysicalCameras] = useState<MediaDeviceInfo[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showPhysicalCameras, setShowPhysicalCameras] = useState(true);

  // Persist selection
  useEffect(() => {
    try {
      if (selectedCameraId != null) {
        localStorage.setItem(
          "cameraSettings:selectedCameraId",
          String(selectedCameraId),
        );
      }
    } catch {
      // ignore
    }
  }, [selectedCameraId]);

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
      console.log("Fetched profile:", profile);
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

  useEffect(() => {
    if (!profile || cameras.length === 0) return;

    const handleConnect = () => {
      console.log("Connected to Cloud server via Socket.io");
    };
    const handleDisconnect = () => {
      console.log("Disconnected from Cloud server");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    for (const camera of cameras) {
      socket.emit("start_relay", {
        targetEdgeId: profile?.organizations?.displayid || "000",
        camId: camera.name,
      });
    }
    // socket.on(
    //   "relay_info",
    //   (relay_info: { success: boolean; data: string }) => {
    //     console.log("Received relay data:", relay_info.data);
    //     if (relay_info.success) {
    //       console.log("Relay data success:", relay_info.data);
    //       const { CameraId, url } = JSON.parse(relay_info.data);
    //       const camera = cameras.find((c) => c.id.toString() === CameraId);
    //       if (camera) {
    //         camera.stream_url = url;
    //         console.log(`Camera ${CameraId} URL: ${url}`);
    //       }
    //       console.log("Relay data processed successfully");
    //     } else {
    //       console.error(`Failed to receive relay data: ${relay_info.data}`); // Error message
    //     }
    //   }
    // );

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [cameras, socket, profile]);

  // Webcam Preview Component
  const WebcamPreview = ({
    deviceId,
    className = "",
  }: {
    deviceId: string;
    className?: string;
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let isMounted = true;

      const startWebcam = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
            audio: false,
          });

          if (isMounted && videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            setStream(mediaStream);
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
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
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
  }: {
    videoSrc: string;
    className?: string;
    autoPlay?: boolean;
    disableMouse?: boolean;
    controls?: boolean;
    enableNotifications?: boolean;
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
              audio.play().catch(() => {
                // Ignore audio play errors (user interaction required)
              });
            } catch {
              // Ignore audio errors
            }
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
        className={`w-full h-full object-cover ${className}`}
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

  function getSelectedCamera() {
    return getAllCameras().find((c: any) => c.id === selectedCameraId);
  }

  // Combine database cameras with physical cameras and hardcoded videos for display
  function getAllCameras() {
    const physicalCamsFormatted = physicalCameras.map((device, index) => ({
      id: `physical_${device.deviceId}`,
      name: `test${index + 1}`,
      url: `webcam://${device.deviceId}`,
      status: "normal",
      detection: true,
      alert_sound: true,
      frame_rate: 30,
      resolution: "1080p",
      device_id: device.deviceId,
      isPhysical: true,
    }));

    const hardcodedVideos = [
      {
        id: "video_1",
        name: "Camera 1",
        url: "/videos/Fall.mp4",
        status: "normal",
        detection: true,
        alert_sound: true,
        frame_rate: 30,
        resolution: "1080p",
        isVideo: true,
      },
      {
        id: "video_2",
        name: "Camera 2",
        url: "/videos/Tussle 1.mp4",
        status: "normal",
        detection: true,
        alert_sound: true,
        frame_rate: 30,
        resolution: "1080p",
        isVideo: true,
      },
      {
        id: "video_3",
        name: "Camera 3",
        url: "/videos/fall 1.mp4",
        status: "normal",
        detection: true,
        alert_sound: true,
        frame_rate: 30,
        resolution: "1080p",
        isVideo: true,
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

    return [...cameras, ...physicalCamsFormatted, ...hardcodedVideos];
  }

  // Physical camera detection functions
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

      // Automatically add each detected physical camera
      for (const device of videoDevices) {
        // await addPhysicalCamera(device.deviceId, device.label, true);
      }

      // Just store in state, don't add to database
      setPhysicalCameras(videoDevices);
    } catch (error) {
      console.error("Error detecting cameras:", error);
    } finally {
      setIsDetecting(false);
    }
  };

  const addPhysicalCamera = async (
    deviceId: string,
    deviceLabel: string,
    silent = false,
  ) => {
    const cameraName = deviceLabel || `Physical Camera ${deviceId.slice(-4)}`;
    const cameraUrl = `webcam://${deviceId}`; // Custom URL format for physical cameras

    // Check if camera already exists to avoid duplicates
    const existingCamera = cameras.find((cam) => cam.url === cameraUrl);
    if (existingCamera) {
      if (!silent) {
        alert(`Camera "${cameraName}" already exists!`);
      }
      return;
    }

    try {
      const res = await fetch("/api/camera/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cameraName,
          url: cameraUrl,
          status: "normal",
          detection: true,
          alert_sound: true,
          frame_rate: 30,
          resolution: "1080p",
          organization_id: profile?.organization_id,
          device_id: deviceId, // Store the physical device ID
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (!silent) {
          alert(data.error || "Failed to add physical camera");
        }
        return;
      }
      setCameras((prev) => [...prev, data.camera]);
      if (!silent) {
        alert(`Physical camera "${cameraName}" added successfully!`);
      }
    } catch (err) {
      if (!silent) {
        alert(`Failed to add physical camera "${cameraName}" - ${err}`);
      }
    }
  };

  const updateCameraSetting = (
    cameraId: number,
    key: keyof CameraConfig,
    value: number | string | boolean,
  ) => {
    setCameras((prev) =>
      prev.map((cam) => (cam.id === cameraId ? { ...cam, [key]: value } : cam)),
    );
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    // Save logic here
    setHasChanges(false);
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    // setCameras(initialCameras);
    setHasChanges(false);
  };

  const handleAddCamera = async () => {
    if (!newCameraUrl.trim() || !newCameraName.trim()) {
      alert("Please enter both camera name and URL");
      return;
    }

    try {
      const res = await fetch("/api/camera/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCameraName,
          url: newCameraUrl,
          status: "normal",
          detection: false,
          alert_sound: false,
          frame_rate: 30,
          resolution: "1080p",
          organization_id: profile?.organization_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to add camera");
        return;
      }
      setCameras((prev) => [...prev, data.camera]);
      setNewCameraUrl("");
      setNewCameraName("");
      setShowAddCameraModal(false);
      alert(`Camera "${newCameraName}" added successfully!`);
    } catch (err) {
      alert(`Failed to add camera "${newCameraName}" - ${err}`);
    }
  };

  const handleDeleteCamera = async (cameraId: number) => {
    if (!confirm("Are you sure you want to delete this camera?")) return;

    try {
      const res = await fetch("/api/camera/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cameraId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete camera");
        return;
      }
      setCameras((prev) => {
        const next = prev.filter((c) => c.id !== cameraId);
        if (selectedCameraId === cameraId) {
          setSelectedCameraId(next[0]?.id);
        }
        return next;
      });
      alert("Camera deleted successfully!");
    } catch {
      alert("Failed to delete camera (network error)");
    }
  };

  const handleEditCamera = (camera: CameraConfig) => {
    setEditingCamera(camera);
    setEditCameraName(camera.name);
    setEditCameraUrl(camera.url || "");
  };

  const handleUpdateCamera = async () => {
    if (!editingCamera) return;
    if (!editCameraName.trim()) {
      alert("Please enter a camera name");
      return;
    }

    try {
      const res = await fetch("/api/camera/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCamera.id,
          name: editCameraName,
          url: editCameraUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update camera");
        return;
      }
      setCameras((prev) =>
        prev.map((c) => (c.id === editingCamera.id ? data.camera : c)),
      );
      setEditingCamera(null);
      setEditCameraName("");
      setEditCameraUrl("");
      alert("Camera updated successfully!");
    } catch {
      alert("Failed to update camera (network error)");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30";
      case "warning":
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30";
      case "offline":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <Wifi className="w-3 h-3" />;
      case "warning":
        return <AlertCircle className="w-3 h-3" />;
      case "offline":
        return <WifiOff className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Camera className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            Camera Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure camera settings for optimal performance
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400">
            <CheckCircle className="w-4 h-4" />
            {
              getAllCameras().filter((c: any) => c.status === "normal").length
            }{" "}
            Online
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <WifiOff className="w-4 h-4" />
            {
              getAllCameras().filter(
                (c: CameraConfig) => c.status === "offline",
              ).length
            }{" "}
            Offline
          </span>
        </div>
      </div>

      {/* Camera Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Connected Cameras
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddCameraModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Add Camera
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {getAllCameras().map((camera: any) => (
            <div
              key={camera.id}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                selectedCameraId === camera.id
                  ? "border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-200 dark:ring-cyan-800"
                  : "border-gray-200 dark:border-slate-600 hover:border-cyan-300 dark:hover:border-cyan-600"
              }`}
            >
              {/* Camera Preview Thumbnail */}
              <button
                onClick={() => setSelectedCameraId(camera.id)}
                className="w-full aspect-video bg-gray-900 dark:bg-slate-950 flex items-center justify-center overflow-hidden"
              >
                {camera.isPhysical ? (
                  <WebcamPreview deviceId={camera.device_id} />
                ) : camera.isVideo ? (
                  <VideoPreview
                    videoSrc={camera.url}
                    autoPlay={false}
                    controls={false}
                    disableMouse
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
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-medium text-gray-800 dark:text-white text-sm truncate">
                    {camera.name}
                  </span>
                  {camera.isPhysical && (
                    <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                      Physical
                    </span>
                  )}
                  {camera.isVideo && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                      Video
                    </span>
                  )}
                </div>
                <span
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(
                    camera.status,
                  )}`}
                >
                  {getStatusIcon(camera.status)}
                  {camera.status}
                </span>
              </div>

              {/* Edit/Delete Buttons - Show on hover for non-physical and non-video cameras */}
              {!camera.isPhysical && !camera.isVideo && (
                <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCamera(camera);
                    }}
                    className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg hover:bg-blue-500 hover:text-white transition-colors shadow-sm"
                    title="Edit Camera"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCamera(camera.id);
                    }}
                    className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                    title="Delete Camera"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {/* Selection Indicator */}
              {selectedCameraId === camera.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Camera Preview & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Preview */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Selected Camera Preview
            </h2>
            {getSelectedCamera() && (
              <button
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all text-sm font-medium"
              >
                <Maximize2 className="w-4 h-4" />
                Fullscreen
              </button>
            )}
          </div>

          {/* Large Preview */}
          <div className="aspect-video bg-gray-900 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center mb-4 relative">
            {getAllCameras().length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Camera className="w-12 h-12 mb-3" />
                <span className="text-sm">No cameras available</span>
              </div>
            ) : (
              getAllCameras().map((camera: any) => (
                <div
                  key={camera.id}
                  className={`absolute inset-0 transition-opacity duration-150 ${
                    selectedCameraId === camera.id
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                  aria-hidden={selectedCameraId !== camera.id}
                >
                  {camera.isPhysical ? (
                    <WebcamPreview
                      deviceId={camera.device_id}
                      className="w-full h-full"
                    />
                  ) : camera.isVideo ? (
                    <VideoPreview
                      videoSrc={camera.url}
                      className="w-full h-full"
                      autoPlay={true}
                      controls={false}
                      disableMouse={camera.id !== selectedCameraId}
                      enableNotifications={selectedCameraId === camera.id}
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

          {/* Status Bar */}
          <div className="flex items-center justify-between text-sm">
            <span
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full capitalize ${getStatusColor(
                getSelectedCamera()?.status || "unknown",
              )}`}
            >
              {getStatusIcon(getSelectedCamera()?.status || "unknown")}
              {getSelectedCamera()?.status || "unknown"}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Status updates every 2s
            </span>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              System Settings
            </h2>
          </div>

          <div className="space-y-6">
            {/* Detection Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-800 dark:text-white">
                  Detection
                </label>
                <button
                  onClick={() => {
                    const cam = getSelectedCamera();
                    if (cam)
                      updateCameraSetting(cam.id, "detection", !cam.detection);
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    (getSelectedCamera()?.detection ?? false)
                      ? "bg-cyan-500"
                      : "bg-gray-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      (getSelectedCamera()?.detection ?? false)
                        ? "left-7"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {(getSelectedCamera()?.detection ?? false) ? (
                  <Eye className="w-4 h-4 text-cyan-500" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span>
                  {(getSelectedCamera()?.detection ?? false)
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Toggle to enable or disable model detection (server-side must
                support this).
              </p>
            </div>

            {/* Alert Sound Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-800 dark:text-white">
                  Alert Sound
                </label>
                <button
                  onClick={() => {
                    const cam = getSelectedCamera();
                    if (cam)
                      updateCameraSetting(
                        cam.id,
                        "alert_sound",
                        !cam.alert_sound,
                      );
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    (getSelectedCamera()?.alert_sound ?? false)
                      ? "bg-cyan-500"
                      : "bg-gray-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      (getSelectedCamera()?.alert_sound ?? false)
                        ? "left-7"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {(getSelectedCamera()?.alert_sound ?? false) ? (
                  <Volume2 className="w-4 h-4 text-cyan-500" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <span>
                  {(getSelectedCamera()?.alert_sound ?? false) ? "On" : "Off"}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                When enabled, the UI will play a sound when a detection occurs
                (frontend).
              </p>
            </div>

            {/* Frame Rate Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-800 dark:text-white">
                  Frame Rate
                </label>
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                  {getSelectedCamera()?.frame_rate ?? 30} fps
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={getSelectedCamera()?.frame_rate ?? 30}
                onChange={(e) => {
                  const cam = getSelectedCamera();
                  if (cam)
                    updateCameraSetting(
                      cam.id,
                      "frame_rate",
                      Number(e.target.value),
                    );
                }}
                className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>5 fps</span>
                <span>60 fps</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Lower frame rate reduces CPU/GPU load; server must use this
                setting.
              </p>
            </div>

            {/* Resolution Selector */}
            <div>
              <label className="font-medium text-gray-800 dark:text-white block mb-2">
                Resolution
              </label>
              <select
                value={getSelectedCamera()?.resolution ?? "1080p"}
                onChange={(e) => {
                  const cam = getSelectedCamera();
                  if (cam)
                    updateCameraSetting(cam.id, "resolution", e.target.value);
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              >
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4K">4K</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={handleSaveSettings}
                disabled={!hasChanges}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  hasChanges
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                    : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Camera Modal */}
      {isFullscreen && getSelectedCamera() && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header - absolute positioned over video */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
            <div className="flex items-center gap-3">
              <Camera className="w-6 h-6 text-cyan-400" />
              <span className="text-white font-semibold text-lg">
                {getSelectedCamera()?.name}
              </span>
              <span
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(
                  getSelectedCamera()?.status || "unknown",
                )}`}
              >
                {getStatusIcon(getSelectedCamera()?.status || "unknown")}
                {getSelectedCamera()?.status}
              </span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <Minimize2 className="w-5 h-5" />
              Exit Fullscreen
            </button>
          </div>
          {/* Camera Feed - fills entire screen */}
          <div className="absolute inset-0 w-full h-full">
            {getAllCameras().map((camera: any) => (
              <div
                key={camera.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-150 ${
                  selectedCameraId === camera.id
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
                aria-hidden={selectedCameraId !== camera.id}
              >
                {camera.isPhysical ? (
                  <WebcamPreview
                    deviceId={camera.device_id}
                    className="w-full h-full"
                  />
                ) : camera.isVideo ? (
                  <VideoPreview
                    videoSrc={camera.url}
                    className="w-full h-full"
                    autoPlay={camera.id !== selectedCameraId}
                    controls={camera.id === selectedCameraId}
                    disableMouse={camera.id !== selectedCameraId}
                    enableNotifications={selectedCameraId === camera.id}
                  />
                ) : (
                  <CameraFeed
                    camera={camera}
                    orgDisplayId={profile?.organizations?.displayid}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Camera Modal */}
      {showAddCameraModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Camera className="w-6 h-6 text-blue-500" />
                Add New Camera
              </h3>
              <button
                onClick={() => {
                  setShowAddCameraModal(false);
                  setNewCameraUrl("");
                  setNewCameraName("");
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Camera Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Camera Name
                </label>
                <input
                  type="text"
                  value={newCameraName}
                  onChange={(e) => setNewCameraName(e.target.value)}
                  placeholder="e.g., Front Door Camera"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                />
              </div>

              {/* Camera URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Camera URL
                </label>
                <input
                  type="text"
                  value={newCameraUrl}
                  onChange={(e) => setNewCameraUrl(e.target.value)}
                  placeholder="https://www.URL.com/ or rtsp://..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter RTSP, or HTTP stream URL
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddCameraModal(false);
                    setNewCameraUrl("");
                    setNewCameraName("");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCamera}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-cyan-500 hover:bg-cyan-600 text-white transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Camera
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Camera Modal */}
      {editingCamera && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Pencil className="w-6 h-6 text-cyan-500" />
                Edit Camera
              </h3>
              <button
                onClick={() => {
                  setEditingCamera(null);
                  setEditCameraName("");
                  setEditCameraUrl("");
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Camera Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Camera Name
                </label>
                <input
                  type="text"
                  value={editCameraName}
                  onChange={(e) => setEditCameraName(e.target.value)}
                  placeholder="e.g., Front Door Camera"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                />
              </div>

              {/* Camera URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Camera URL
                </label>
                <input
                  type="text"
                  value={editCameraUrl}
                  onChange={(e) => setEditCameraUrl(e.target.value)}
                  placeholder="https://www.URL.com/ or rtsp://..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter RTSP, or HTTP stream URL
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditingCamera(null);
                    setEditCameraName("");
                    setEditCameraUrl("");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCamera}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-cyan-500 hover:bg-cyan-600 text-white transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
