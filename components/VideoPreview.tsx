import { pushNotification, VideoNotification } from "@/lib/videoNotifications";
import { Camera } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

export default function VideoPreview({
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
}) {
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
      className={`w-full h-full object-cover ${className}`}
      autoPlay={autoPlay}
      muted
      loop
      playsInline
      controls={false}
      style={disableMouse ? { pointerEvents: "none" } : {}}
      onTimeUpdate={handleTimeUpdate}
      onPlay={handlePlay}
    />
  );
}
