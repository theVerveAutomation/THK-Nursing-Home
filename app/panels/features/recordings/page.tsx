"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  Camera,
  Calendar,
  Clock,
  Download,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Search,
  HardDrive,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  FileVideo,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Profile, CameraConfig } from "@/types";

// Recording type definition
interface Recording {
  id: string;
  camera_id: number;
  camera_name: string;
  start_time: string;
  end_time: string;
  duration: number; // in seconds
  file_size: number; // in MB
  file_url: string;
  thumbnail_url?: string;
  has_detections: boolean;
  detection_count: number;
}

export default function RecordingPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [cameras, setCameras] = useState<CameraConfig[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCameraId, setSelectedCameraId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Playback
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordingsPerPage = 12;

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
        .select("*")
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

  // Fetch cameras when profile is available
  useEffect(() => {
    if (!profile) return;

    const fetchCameras = async () => {
      try {
        const res = await fetch(
          `/api/camera/fetch?organization_id=${encodeURIComponent(
            profile.organization_id
          )}`
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.cameras)) {
          setCameras(data.cameras);
        }
      } catch (err) {
        console.error("Error fetching cameras:", err);
      }
    };

    fetchCameras();
  }, [profile]);

  // Fetch recordings (simulated for now - replace with actual API call)
  useEffect(() => {
    if (!profile || cameras.length === 0) return;

    const fetchRecordings = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const res = await fetch(`/api/recordings/fetch?organization_id=${profile.organization_id}`);
        // const data = await res.json();

        // Simulated recordings data based on actual cameras
        const simulatedRecordings: Recording[] = cameras.flatMap((camera) => {
          const recordingsForCamera: Recording[] = [];
          const now = new Date();

          // Generate some sample recordings for each camera
          for (let i = 0; i < 5; i++) {
            const startTime = new Date(
              now.getTime() - (i + 1) * 3600000 - Math.random() * 7200000
            );
            const duration = Math.floor(Math.random() * 3600) + 300; // 5 min to 1 hour
            const endTime = new Date(startTime.getTime() + duration * 1000);

            recordingsForCamera.push({
              id: `${camera.id}-${i}`,
              camera_id: camera.id,
              camera_name: camera.name,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              duration,
              file_size: Math.floor(Math.random() * 500) + 50, // 50-550 MB
              file_url: camera.url || "",
              has_detections: Math.random() > 0.5,
              detection_count: Math.floor(Math.random() * 20),
            });
          }
          return recordingsForCamera;
        });

        // Sort by start time descending
        simulatedRecordings.sort(
          (a, b) =>
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );

        setRecordings(simulatedRecordings);
        setFilteredRecordings(simulatedRecordings);
      } catch (err) {
        console.error("Error fetching recordings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, [profile, cameras]);

  // Apply filters
  useEffect(() => {
    let filtered = [...recordings];

    // Camera filter
    if (selectedCameraId !== "all") {
      filtered = filtered.filter(
        (r) => r.camera_id === parseInt(selectedCameraId)
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((r) =>
        r.camera_name.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((r) => r.start_time.startsWith(dateFilter));
    }

    setFilteredRecordings(filtered);
    setCurrentPage(1);
  }, [recordings, selectedCameraId, searchQuery, dateFilter]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  // Format file size
  const formatFileSize = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb} MB`;
  };

  // Format date/time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredRecordings.length / recordingsPerPage);
  const paginatedRecordings = filteredRecordings.slice(
    (currentPage - 1) * recordingsPerPage,
    currentPage * recordingsPerPage
  );

  // Total storage used
  const totalStorage = recordings.reduce((acc, r) => acc + r.file_size, 0);

  // Handle video playback
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  // Delete recording handler
  const handleDeleteRecording = async (recordingId: string) => {
    if (!confirm("Are you sure you want to delete this recording?")) return;

    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/recordings/delete`, {
      //   method: "DELETE",
      //   body: JSON.stringify({ id: recordingId }),
      // });

      setRecordings((prev) => prev.filter((r) => r.id !== recordingId));
      if (selectedRecording?.id === recordingId) {
        setSelectedRecording(null);
      }
      alert("Recording deleted successfully!");
    } catch (err) {
      alert("Failed to delete recording");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg text-slate-600 dark:text-slate-300 font-medium">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Video className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Recordings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage camera recordings for your organization
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
            <FileVideo className="w-4 h-4" />
            {recordings.length} Recordings
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
            <HardDrive className="w-4 h-4" />
            {formatFileSize(totalStorage)}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by camera name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Camera Filter */}
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Cameras</option>
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedCameraId !== "all" || dateFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCameraId("all");
                setDateFilter("");
              }}
              className="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recordings List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {paginatedRecordings.length} of{" "}
              {filteredRecordings.length} recordings
            </span>
            {filteredRecordings.length > recordingsPerPage && (
              <span>
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>

          {/* Recordings Grid */}
          {paginatedRecordings.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                No recordings found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {recordings.length === 0
                  ? "No recordings available for your cameras yet."
                  : "Try adjusting your filters to find recordings."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paginatedRecordings.map((recording) => (
                <div
                  key={recording.id}
                  onClick={() => setSelectedRecording(recording)}
                  className={`group bg-white dark:bg-slate-800 rounded-xl shadow-md border transition-all cursor-pointer hover:shadow-lg ${
                    selectedRecording?.id === recording.id
                      ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                      : "border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-900 rounded-t-xl overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="w-10 h-10 text-gray-600" />
                    </div>
                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-xs">
                      {formatDuration(recording.duration)}
                    </div>
                    {/* Detection badge */}
                    {recording.has_detections && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500/90 rounded text-white text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {recording.detection_count}
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                          {recording.camera_name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(recording.start_time)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(recording.file_size)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Download logic
                          if (recording.file_url) {
                            window.open(recording.file_url, "_blank");
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecording(recording.id);
                        }}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Video Player Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-500" />
              Video Player
            </h3>

            {selectedRecording ? (
              <div className="space-y-4">
                {/* Video */}
                <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                  {selectedRecording.file_url ? (
                    <video
                      ref={videoRef}
                      src={selectedRecording.file_url}
                      className="w-full h-full object-contain"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                      controls={false}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleSkip(-10)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSkip(10)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Recording Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Camera</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {selectedRecording.camera_name}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Start Time</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {formatDateTime(selectedRecording.start_time)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Duration</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {formatDuration(selectedRecording.duration)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>File Size</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {formatFileSize(selectedRecording.file_size)}
                    </span>
                  </div>
                  {selectedRecording.has_detections && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Detections</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        {selectedRecording.detection_count} events
                      </span>
                    </div>
                  )}
                </div>

                {/* Download Button */}
                <button
                  onClick={() => {
                    if (selectedRecording.file_url) {
                      window.open(selectedRecording.file_url, "_blank");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Recording
                </button>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a recording to play</p>
                </div>
              </div>
            )}
          </div>

          {/* Storage Summary */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Storage Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm opacity-90">Total Recordings</span>
                <span className="font-bold">{recordings.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-90">Storage Used</span>
                <span className="font-bold">
                  {formatFileSize(totalStorage)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-90">Cameras</span>
                <span className="font-bold">{cameras.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-90">With Detections</span>
                <span className="font-bold">
                  {recordings.filter((r) => r.has_detections).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
