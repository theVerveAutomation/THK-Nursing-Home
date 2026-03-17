import { CameraConfig } from "@/types";
import { Camera, WifiOff } from "lucide-react";

const STREAM_URL =
  process.env.NEXT_PUBLIC_STREAM_URL || "http://localhost:3001";

export default function CameraFeed({
  camera,
  orgDisplayId,
}: {
  camera?: CameraConfig;
  orgDisplayId?: string;
}) {
  if (!camera) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs">
        <Camera className="w-8 h-8 mb-1" />
        <span>No Camera Selected</span>
      </div>
    );
  }
  if (camera.status === "offline") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs">
        <WifiOff className="w-8 h-8 mb-1" />
        <span>Offline</span>
      </div>
    );
  }

  // If it's a URL-based camera, show iframe or image
  if (camera.name) {
    const stream_path = `${orgDisplayId ?? "000"}_${camera.name}`;
    // For all URLs (RTSP converted to HLS or HTTP streams, or others)
    return (
      <div className="relative w-full h-full bg-slate-900">
        <iframe
          src={`${STREAM_URL}/${stream_path}`}
          className="w-full h-full pointer-events-none"
          title={camera.name}
        />
      </div>
    );
  }
}
