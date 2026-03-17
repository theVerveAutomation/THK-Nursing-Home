"use client";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function WebcamPreview({
  deviceId,
  className = "",
}: {
  deviceId: string;
  className?: string;
}) {
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
}
