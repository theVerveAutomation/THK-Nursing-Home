"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  Camera,
  Calendar,
  Clock,
  Download,
  Search,
  HardDrive,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  ZoomIn,
  XCircle,
  Folder,
  FolderOpen,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
// import { Profile, CameraConfig, Snapshot, CameraFolder } from "@/types";
import Image from "next/image";
import { CameraFolder, Snapshot } from "@/types";

// Camera folder with snapshot count

export default function SnapshotPage() {
  const router = useRouter();

  // MOCK DATA
  const [loading, setLoading] = useState(false);
  const [cameras] = useState([
    { id: 1, name: "Camera 1", status: "online" },
    { id: 2, name: "Camera 2", status: "online" },
    { id: 3, name: "Camera 3", status: "online" },
    { id: 4, name: "Camera 4", status: "offline" },
    { id: 5, name: "Camera 5", status: "online" },
  ]);
  const [snapshots, setSnapshots] = useState([
    {
      id: 1,
      camera_id: 1,
      camera_name: "Cam 1 - Main Lobby",
      url: "/mock-snapshots/snap1.jpg",
      created_at: "2026-01-30T09:15:00Z",
    },
    {
      id: 2,
      camera_id: 1,
      camera_name: "Cam 1 - Main Lobby",
      url: "/mock-snapshots/snap2.jpg",
      created_at: "2026-01-30T08:45:00Z",
    },
    {
      id: 3,
      camera_id: 2,
      camera_name: "Cam 2 - Corridor B",
      url: "/mock-snapshots/snap3.jpg",
      created_at: "2026-01-29T17:20:00Z",
    },
    {
      id: 4,
      camera_id: 3,
      camera_name: "Cam 3 - Warehouse",
      url: "/mock-snapshots/snap4.jpg",
      created_at: "2026-01-28T14:05:00Z",
    },
  ]);

  // View mode: "folders" or "snapshots"
  const [viewMode, setViewMode] = useState<"folders" | "snapshots">("folders");
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null);

  // Selected folder for details panel (folders view)
  const [selectedFolder, setSelectedFolder] = useState<CameraFolder | null>(
    null,
  );

  // Filters (only for snapshots view)
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Preview
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(
    null,
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const snapshotsPerPage = 12;

  // All API and Supabase logic removed; using mock data only

  // Compute camera folders with snapshot counts
  const cameraFolders: CameraFolder[] = useMemo(() => {
    return cameras.map((camera) => {
      const cameraSnapshots = snapshots.filter(
        (s) => s.camera_id === camera.id,
      );
      const latestSnapshot = cameraSnapshots.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0];

      return {
        camera,
        snapshotCount: cameraSnapshots.length,
        latestSnapshot,
      };
    });
  }, [cameras, snapshots]);

  // Get snapshots for selected camera with filters
  const filteredSnapshots = useMemo(() => {
    if (selectedCameraId === null) return [];

    let filtered = snapshots.filter((s) => s.camera_id === selectedCameraId);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.camera_name.toLowerCase().includes(query) ||
          s.created_at.toLowerCase().includes(query),
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((s) => s.created_at.startsWith(dateFilter));
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [snapshots, selectedCameraId, searchQuery, dateFilter]);

  // Get selected camera name
  const selectedCameraName = useMemo(() => {
    if (selectedCameraId === null) return "";
    const camera = cameras.find((c) => c.id === selectedCameraId);
    return camera?.name || `Camera ${selectedCameraId}`;
  }, [cameras, selectedCameraId]);

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
  const totalPages = Math.ceil(filteredSnapshots.length / snapshotsPerPage);
  const paginatedSnapshots = filteredSnapshots.slice(
    (currentPage - 1) * snapshotsPerPage,
    currentPage * snapshotsPerPage,
  );

  // Open camera folder
  const handleOpenFolder = (cameraId: number) => {
    setSelectedCameraId(cameraId);
    setViewMode("snapshots");
    setCurrentPage(1);
    setSelectedSnapshot(null);
    setSelectedFolder(null);
    setSearchQuery("");
    setDateFilter("");
  };

  // Go back to folders view
  const handleBackToFolders = () => {
    setViewMode("folders");
    setSelectedCameraId(null);
    setSelectedSnapshot(null);
    setSelectedFolder(null);
    setSearchQuery("");
    setDateFilter("");
  };

  // Delete snapshot handler
  const handleDeleteSnapshot = async (snapshot: Snapshot) => {
    if (!confirm("Are you sure you want to delete this snapshot?")) return;

    try {
      const { error } = await supabase
        .from("camera_snaps")
        .delete()
        .eq("id", snapshot.id);

      if (error) {
        console.error("Error deleting snapshot:", error);
        alert("Failed to delete snapshot");
        return;
      }

      setSnapshots((prev) => prev.filter((s) => s.id !== snapshot.id));
      if (selectedSnapshot?.id === snapshot.id) {
        setSelectedSnapshot(null);
      }
      alert("Snapshot deleted successfully!");
    } catch (err) {
      console.error("Error deleting snapshot:", err);
      alert("Failed to delete snapshot");
    }
  };

  // Download snapshot
  const handleDownload = async (snapshot: Snapshot) => {
    try {
      // Fetch the image as a blob to bypass cross-origin restrictions
      const response = await fetch(snapshot.url);
      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `snapshot_${snapshot.camera_name}_${
        new Date(snapshot.created_at).toISOString().split("T")[0]
      }.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading snapshot:", err);
      alert("Failed to download snapshot. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg text-slate-600 dark:text-slate-300 font-medium">
            Loading snapshots...
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
            <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Snapshots
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {viewMode === "folders"
              ? "Select a camera folder to view snapshots"
              : `Viewing snapshots from ${selectedCameraName}`}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
            <ImageIcon className="w-4 h-4" />
            {snapshots.length} Snapshots
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
            <Folder className="w-4 h-4" />
            {cameras.length} Cameras
          </span>
        </div>
      </div>

      {/* Breadcrumb / Back Button (only in snapshots view) */}
      {viewMode === "snapshots" && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToFolders}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cameras
          </button>
          <span className="text-gray-400 dark:text-gray-500">/</span>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
            <FolderOpen className="w-4 h-4" />
            {selectedCameraName}
          </span>
        </div>
      )}

      {/* FOLDERS VIEW - Windows Explorer Style */}
      {viewMode === "folders" && (
        <div className="flex gap-6">
          {/* Left: Folders List */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            {cameraFolders.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  No cameras found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Add cameras in Camera Settings to start capturing snapshots.
                </p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-600 dark:text-gray-400">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-3">Date Modified</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2 text-right">Items</div>
                </div>

                {/* Folder Rows */}
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                  {cameraFolders.map((folder) => (
                    <div
                      key={folder.camera.id}
                      onClick={() => setSelectedFolder(folder)}
                      onDoubleClick={() => handleOpenFolder(folder.camera.id)}
                      className={`grid grid-cols-12 gap-4 px-4 py-3 cursor-pointer transition-colors ${
                        selectedFolder?.camera.id === folder.camera.id
                          ? "bg-blue-50 dark:bg-blue-900/30"
                          : "hover:bg-gray-50 dark:hover:bg-slate-700/30"
                      }`}
                    >
                      {/* Name with Folder Icon */}
                      <div className="col-span-5 flex items-center gap-3">
                        <Folder className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                        <span className="text-gray-800 dark:text-white font-medium truncate">
                          {folder.camera.name}
                        </span>
                      </div>

                      {/* Date Modified */}
                      <div className="col-span-3 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        {folder.latestSnapshot
                          ? formatDateTime(folder.latestSnapshot.created_at)
                          : "—"}
                      </div>

                      {/* Type */}
                      <div className="col-span-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        File folder
                      </div>

                      {/* Items Count */}
                      <div className="col-span-2 flex items-center justify-end text-sm text-gray-600 dark:text-gray-400">
                        {folder.snapshotCount}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right: Details Panel */}
          <div className="w-80 flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5">
            {selectedFolder ? (
              <div className="space-y-5">
                {/* Folder Icon & Name */}
                <div className="text-center pb-4 border-b border-gray-100 dark:border-slate-700">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Folder className="w-10 h-10 text-amber-500 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {selectedFolder.camera.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    File folder
                  </p>
                </div>

                {/* Preview Thumbnail */}
                {selectedFolder.latestSnapshot && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Latest Snapshot
                    </p>
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                      <img
                        src={selectedFolder.latestSnapshot.url}
                        alt="Latest snapshot preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-white text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(
                            selectedFolder.latestSnapshot.created_at,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Folder Details */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Details
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Snapshots
                      </span>
                      <span className="text-gray-800 dark:text-white font-medium">
                        {selectedFolder.snapshotCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Camera ID
                      </span>
                      <span className="text-gray-800 dark:text-white font-medium">
                        {selectedFolder.camera.id}
                      </span>
                    </div>
                    {selectedFolder.latestSnapshot && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Last Modified
                        </span>
                        <span className="text-gray-800 dark:text-white font-medium text-right">
                          {formatDateTime(
                            selectedFolder.latestSnapshot.created_at,
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Status
                      </span>
                      <span
                        className={`font-medium capitalize ${
                          selectedFolder.camera.status === "normal"
                            ? "text-green-600 dark:text-green-400"
                            : selectedFolder.camera.status === "warning"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {selectedFolder.camera.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Open Folder Button */}
                <button
                  onClick={() => handleOpenFolder(selectedFolder.camera.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  Open Folder
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                  <Folder className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select a folder to see details
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Double-click to open
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SNAPSHOTS VIEW */}
      {viewMode === "snapshots" && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search snapshots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
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
              {(searchQuery || dateFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
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
            {/* Snapshots List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Results count */}
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Showing {paginatedSnapshots.length} of{" "}
                  {filteredSnapshots.length} snapshots
                </span>
                {filteredSnapshots.length > snapshotsPerPage && (
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                )}
              </div>

              {/* Snapshots Grid */}
              {paginatedSnapshots.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    No snapshots found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {filteredSnapshots.length === 0 &&
                    !searchQuery &&
                    !dateFilter
                      ? "No snapshots available for this camera yet."
                      : "Try adjusting your filters to find snapshots."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paginatedSnapshots.map((snapshot) => (
                    <div
                      key={snapshot.id}
                      onClick={() => setSelectedSnapshot(snapshot)}
                      onDoubleClick={() => {
                        setSelectedSnapshot(snapshot);
                        setIsLightboxOpen(true);
                      }}
                      className={`group bg-white dark:bg-slate-800 rounded-xl shadow-md border transition-all cursor-pointer hover:shadow-lg ${
                        selectedSnapshot?.id === snapshot.id
                          ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                          : "border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gray-900 rounded-t-xl overflow-hidden">
                        {snapshot.url ? (
                          <Image
                            src={snapshot.url}
                            alt={`Snapshot from ${snapshot.camera_name}`}
                            className="w-full h-full object-cover"
                            width={640}
                            height={360}
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Camera className="w-10 h-10 text-gray-600" />
                          </div>
                        )}
                        {/* Zoom icon indicator on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-gray-800" />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(snapshot.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(snapshot);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSnapshot(snapshot);
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

            {/* Preview Panel */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  Preview
                </h3>

                {selectedSnapshot ? (
                  <div className="space-y-4">
                    {/* Image Preview */}
                    <div
                      className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden cursor-pointer"
                      onClick={() => setIsLightboxOpen(true)}
                    >
                      {selectedSnapshot.url ? (
                        <img
                          src={selectedSnapshot.url}
                          alt={`Snapshot from ${selectedSnapshot.camera_name}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <ZoomIn className="w-6 h-6 text-gray-800" />
                        </div>
                      </div>
                    </div>

                    {/* Snapshot Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Camera</span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {selectedSnapshot.camera_name}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Captured</span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {formatDateTime(selectedSnapshot.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={() => handleDownload(selectedSnapshot)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Snapshot
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select a snapshot to preview</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  {selectedCameraName}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm opacity-90">Snapshots</span>
                    <span className="font-bold">
                      {filteredSnapshots.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm opacity-90">
                      Total (All Cameras)
                    </span>
                    <span className="font-bold">{snapshots.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedSnapshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setIsLightboxOpen(false)}
          >
            <XCircle className="w-8 h-8 text-white" />
          </button>
          <img
            src={selectedSnapshot.url}
            alt={`Snapshot from ${selectedSnapshot.camera_name}`}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-lg text-white text-sm">
            {selectedSnapshot.camera_name} •{" "}
            {formatDateTime(selectedSnapshot.created_at)}
          </div>
        </div>
      )}
    </div>
  );
}
