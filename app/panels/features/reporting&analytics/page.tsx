"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Eye,
  Activity,
  UserCheck,
  Camera,
  AlertTriangle,
  Clock,
  Filter,
  ChevronDown,
} from "lucide-react";

type TimeRange = "7d" | "30d" | "90d" | "1y";
type ReportType = "daily" | "weekly" | "monthly";

const detectionTrendData = [
  {
    date: "Jan 1",
    fall: 2,
    tussle: 1,
    pacing: 1,
    erraticMovements: 1,
    armFlailing: 2,
    facialExpressions: 1,
    thermalIndicators: 1,
  },
  {
    date: "Jan 2",
    fall: 3,
    tussle: 2,
    pacing: 2,
    erraticMovements: 1,
    armFlailing: 2,
    facialExpressions: 1,
    thermalIndicators: 1,
  },
  {
    date: "Jan 3",
    fall: 2,
    tussle: 1,
    pacing: 1,
    erraticMovements: 1,
    armFlailing: 1,
    facialExpressions: 0,
    thermalIndicators: 1,
  },
  {
    date: "Jan 4",
    fall: 4,
    tussle: 2,
    pacing: 2,
    erraticMovements: 2,
    armFlailing: 3,
    facialExpressions: 2,
    thermalIndicators: 1,
  },
  {
    date: "Jan 5",
    fall: 3,
    tussle: 2,
    pacing: 2,
    erraticMovements: 1,
    armFlailing: 2,
    facialExpressions: 1,
    thermalIndicators: 1,
  },
  {
    date: "Jan 6",
    fall: 4,
    tussle: 3,
    pacing: 3,
    erraticMovements: 2,
    armFlailing: 3,
    facialExpressions: 2,
    thermalIndicators: 2,
  },
  {
    date: "Jan 7",
    fall: 2,
    tussle: 1,
    pacing: 1,
    erraticMovements: 1,
    armFlailing: 2,
    facialExpressions: 1,
    thermalIndicators: 1,
  },
];

const alertDistribution = [
  { name: "Critical", value: 1, color: "#dc2626" },
  { name: "High", value: 2, color: "#f59e0b" },
  { name: "Medium", value: 4, color: "#3b82f6" },
  { name: "Low", value: 8, color: "#10b981" },
];

const cameraPerformance = [
  { camera: "Camera 1", uptime: 99.8, detections: 45, alerts: 8 },
  { camera: "Camera 2", uptime: 98.5, detections: 38, alerts: 6 },
  { camera: "Camera 3", uptime: 100, detections: 32, alerts: 4 },
  { camera: "Camera 4", uptime: 97.2, detections: 28, alerts: 5 },
  { camera: "Camera 5", uptime: 96.8, detections: 25, alerts: 4 },
];

const hourlyActivityData = [
  { hour: "00:00", activity: 1 },
  { hour: "03:00", activity: 0 },
  { hour: "06:00", activity: 2 },
  { hour: "09:00", activity: 4 },
  { hour: "12:00", activity: 6 },
  { hour: "15:00", activity: 6 },
  { hour: "18:00", activity: 5 },
  { hour: "21:00", activity: 3 },
];

const weeklyComparison = [
  { week: "Week 1", thisYear: 26, lastYear: 24 },
  { week: "Week 2", thisYear: 28, lastYear: 25 },
  { week: "Week 3", thisYear: 29, lastYear: 26 },
  { week: "Week 4", thisYear: 31, lastYear: 27 },
];

const reports = [
  {
    id: 1,
    title: "Daily Detection Summary",
    type: "Daily Report (PDF)",
    date: "Jan 5, 2026",
    size: "1.2 MB",
    icon: FileText,
  },
  {
    id: 2,
    title: "Weekly Analytics Report",
    type: "Weekly Report (PDF)",
    date: "Jan 1-7, 2026",
    size: "2.1 MB",
    icon: FileText,
  },
  {
    id: 3,
    title: "Monthly Performance Review",
    type: "Monthly Report (PDF)",
    date: "December 2025",
    size: "3.8 MB",
    icon: FileText,
  },
  {
    id: 4,
    title: "Alert Analysis Report",
    type: "Custom Report (PDF)",
    date: "Last 30 days",
    size: "1.5 MB",
    icon: FileText,
  },
];

const metrics = [
  {
    title: "Total Detections",
    value: "21",
    change: "+71.5%",
    trend: "up",
    icon: Eye,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-900/30",
  },
  {
    title: "Active Cameras",
    value: "5/5",
    change: "100%",
    trend: "stable",
    icon: Camera,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-900/30",
  },
  {
    title: "Total Alerts",
    value: "7",
    change: "-8.3%",
    trend: "down",
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/30",
  },
  {
    title: "Avg Response Time",
    value: "2.3s",
    change: "-15.2%",
    trend: "down",
    icon: Clock,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-900/30",
  },
];

export default function ReportingAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [reportType, setReportType] = useState<ReportType>("daily");
  const [showFilters, setShowFilters] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState<number | null>(
    null,
  );

  // Filter states
  const [filters, setFilters] = useState({
    includeMetrics: true,
    includeDetectionTrends: true,
    includeAlerts: true,
    includeCameraPerformance: true,
    includeHourlyActivity: true,
    includeWeeklyComparison: true,
    minUptimeFilter: 0,
    alertSeverityFilter: "all" as
      | "all"
      | "critical"
      | "high"
      | "medium"
      | "low",
    cameraFilter: "all" as "all" | string,
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
    detectionTypeFilter: "all" as
      | "all"
      | "fall"
      | "tussle"
      | "pacing"
      | "erraticMovements"
      | "armFlailing"
      | "facialExpressions"
      | "thermalIndicators"
      | "allDetections",
    minDetectionCount: 0,
    maxDetectionCount: 1000,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter data based on current filter settings
  const getFilteredDetectionData = () => {
    let filtered = detectionTrendData.map((item) => ({
      ...item,
      total:
        item.fall +
        item.tussle +
        item.pacing +
        item.erraticMovements +
        item.armFlailing +
        item.facialExpressions +
        item.thermalIndicators,
    }));

    if (filters.detectionTypeFilter === "fall") {
      filtered = filtered.map((item) => ({
        ...item,
        tussle: 0,
        pacing: 0,
        erraticMovements: 0,
        armFlailing: 0,
        facialExpressions: 0,
        thermalIndicators: 0,
        total: item.fall,
      }));
    } else if (filters.detectionTypeFilter === "tussle") {
      filtered = filtered.map((item) => ({
        ...item,
        fall: 0,
        pacing: 0,
        erraticMovements: 0,
        armFlailing: 0,
        facialExpressions: 0,
        thermalIndicators: 0,
        total: item.tussle,
      }));
    } else if (filters.detectionTypeFilter === "pacing") {
      filtered = filtered.map((item) => ({
        ...item,
        fall: 0,
        tussle: 0,
        erraticMovements: 0,
        armFlailing: 0,
        facialExpressions: 0,
        thermalIndicators: 0,
        total: item.pacing,
      }));
    } else if (filters.detectionTypeFilter === "erraticMovements") {
      filtered = filtered.map((item) => ({
        ...item,
        fall: 0,
        tussle: 0,
        pacing: 0,
        armFlailing: 0,
        facialExpressions: 0,
        thermalIndicators: 0,
        total: item.erraticMovements,
      }));
    } else if (filters.detectionTypeFilter === "armFlailing") {
      filtered = filtered.map((item) => ({
        ...item,
        fall: 0,
        tussle: 0,
        pacing: 0,
        erraticMovements: 0,
        facialExpressions: 0,
        thermalIndicators: 0,
        total: item.armFlailing,
      }));
    } else if (filters.detectionTypeFilter === "facialExpressions") {
      filtered = filtered.map((item) => ({
        ...item,
        fall: 0,
        tussle: 0,
        pacing: 0,
        erraticMovements: 0,
        armFlailing: 0,
        thermalIndicators: 0,
        total: item.facialExpressions,
      }));
    } else if (filters.detectionTypeFilter === "thermalIndicators") {
      filtered = filtered.map((item) => ({
        ...item,
        fall: 0,
        tussle: 0,
        pacing: 0,
        erraticMovements: 0,
        armFlailing: 0,
        facialExpressions: 0,
        total: item.thermalIndicators,
      }));
    } else if (filters.detectionTypeFilter === "allDetections") {
      filtered = filtered.map((item) => ({
        ...item,
        fall: 0,
        tussle: 0,
        pacing: 0,
        erraticMovements: 0,
        armFlailing: 0,
        facialExpressions: 0,
        thermalIndicators: 0,
      }));
    }

    return filtered;
  };

  const getFilteredCameraData = () => {
    let filtered = [...cameraPerformance];

    // Filter by minimum uptime
    if (filters.minUptimeFilter > 0) {
      filtered = filtered.filter(
        (cam) => cam.uptime >= filters.minUptimeFilter,
      );
    }

    // Filter by specific camera
    if (filters.cameraFilter !== "all") {
      filtered = filtered.filter((cam) => cam.camera === filters.cameraFilter);
    }

    // Filter by detection count range
    filtered = filtered.filter(
      (cam) =>
        cam.detections >= filters.minDetectionCount &&
        cam.detections <= filters.maxDetectionCount,
    );

    return filtered;
  };

  const getFilteredAlertData = () => {
    let filtered = [...alertDistribution];

    if (filters.alertSeverityFilter !== "all") {
      filtered = filtered.filter(
        (alert) => alert.name.toLowerCase() === filters.alertSeverityFilter,
      );
    }

    return filtered;
  };

  // Helper function to download predefined PDF
  const downloadPredefinedPDF = (filename: string) => {
    const link = document.createElement("a");
    link.href = "/reports/Video_Analytics_Report.pdf";
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle downloading existing reports
  const handleDownloadReport = async (reportId: number) => {
    setDownloadingReport(reportId);

    try {
      let filename = "";

      switch (reportId) {
        case 1:
          filename = "daily-detection-summary.pdf";
          break;
        case 2:
          filename = "weekly-analytics-report.pdf";
          break;
        case 3:
          filename = "monthly-performance-review.pdf";
          break;
        case 4:
          filename = "alert-analysis-report.pdf";
          break;
        default:
          throw new Error("Unknown report type");
      }

      // Simulate loading time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      downloadPredefinedPDF(filename);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloadingReport(null);
    }
  };

  // Handle generating new report
  const handleGenerateNewReport = async () => {
    setIsGenerating(true);

    try {
      // Simulate generation time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const filename = `comprehensive-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      downloadPredefinedPDF(filename);

      alert("Report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            {/* <BarChart className="w-8 h-8 text-cyan-600 dark:text-cyan-400" /> */}
            Reporting & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none appearance-none pr-10"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          {/* Export Button */}
          <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
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
              <span
                className={`text-sm font-medium px-2 py-1 rounded-full ${
                  metric.trend === "up"
                    ? "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
                    : metric.trend === "down"
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      : "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400"
                }`}
              >
                {metric.change}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {metric.title}
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Trends */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Detection Trends
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Daily detection activity by type
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={getFilteredDetectionData()}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <Tooltip
                wrapperStyle={{ zIndex: 9999 }}
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                  zIndex: 9999,
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="fall"
                stroke="#ef4444"
                strokeWidth={2}
                name="Fall"
              />
              <Line
                type="monotone"
                dataKey="tussle"
                stroke="#f97316"
                strokeWidth={2}
                name="Tussle"
              />
              <Line
                type="monotone"
                dataKey="pacing"
                stroke="#06b6d4"
                strokeWidth={2}
                name="Pacing"
              />
              <Line
                type="monotone"
                dataKey="erraticMovements"
                stroke="#a21caf"
                strokeWidth={2}
                name="Erratic Movements"
              />
              <Line
                type="monotone"
                dataKey="armFlailing"
                stroke="#f59e42"
                strokeWidth={2}
                name="Arm Flailing"
              />
              <Line
                type="monotone"
                dataKey="facialExpressions"
                stroke="#eab308"
                strokeWidth={2}
                name="Facial Expressions"
              />
              <Line
                type="monotone"
                dataKey="thermalIndicators"
                stroke="#14b8a6"
                strokeWidth={2}
                name="Thermal Indicators"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Alert Distribution
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Alerts by severity level
              </p>
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={getFilteredAlertData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${Math.round((percent ?? 0) * 100)}%`
                }
                outerRadius={80}
                dataKey="value"
              >
                {alertDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Hourly Activity Pattern
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detection activity by hour
              </p>
            </div>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourlyActivityData}>
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="hour"
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="activity"
                stroke="#06b6d4"
                fillOpacity={1}
                fill="url(#colorActivity)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Year-over-Year Comparison
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Weekly detection comparison
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyComparison}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="week"
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="thisYear"
                name="2026"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="lastYear"
                name="2025"
                fill="#6b7280"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Camera Performance Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Camera Performance
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Individual camera statistics and uptime
            </p>
          </div>
          <Camera className="w-5 h-5 text-blue-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Camera
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Uptime
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Detections
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Alerts
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {getFilteredCameraData().map((camera, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-white font-medium">
                    {camera.camera}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
                        <div
                          className={`h-full ${
                            camera.uptime >= 99
                              ? "bg-blue-500"
                              : camera.uptime >= 95
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${camera.uptime}%` }}
                        />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-xs">
                        {camera.uptime}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {camera.detections}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {camera.alerts}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        camera.uptime >= 99
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {camera.uptime >= 99 ? "Excellent" : "Good"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generated Reports */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Generated Reports
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Download previously generated reports
            </p>
          </div>
          <button
            onClick={handleGenerateNewReport}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              "Generate New Report"
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <report.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                  {report.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {report.type} • {report.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {report.size}
                </span>
                <button
                  onClick={() => handleDownloadReport(report.id)}
                  disabled={downloadingReport === report.id}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors relative"
                  title={`Download ${report.title}`}
                >
                  {downloadingReport === report.id ? (
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Report Filters
                </h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Section Filters */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Include Sections
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.includeMetrics}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            includeMetrics: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 dark:border-slate-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Metrics
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.includeDetectionTrends}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            includeDetectionTrends: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 dark:border-slate-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Detection Trends
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.includeAlerts}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            includeAlerts: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 dark:border-slate-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Alerts
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.includeCameraPerformance}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            includeCameraPerformance: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 dark:border-slate-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Camera Performance
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.includeHourlyActivity}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            includeHourlyActivity: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 dark:border-slate-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Hourly Activity
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.includeWeeklyComparison}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            includeWeeklyComparison: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 dark:border-slate-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Weekly Comparison
                      </span>
                    </label>
                  </div>
                </div>

                {/* Data Filters */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Data Filters
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date Range Filter */}
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Date Range
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={filters.dateRange.start}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              dateRange: {
                                ...filters.dateRange,
                                start: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm"
                        />
                        <span className="self-center text-gray-500">to</span>
                        <input
                          type="date"
                          value={filters.dateRange.end}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              dateRange: {
                                ...filters.dateRange,
                                end: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    {/* Detection Type Filter */}
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Detection Type
                      </label>
                      <select
                        value={filters.detectionTypeFilter}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            detectionTypeFilter: e.target.value as
                              | "all"
                              | "fall"
                              | "tussle"
                              | "pacing"
                              | "erraticMovements"
                              | "armFlailing"
                              | "facialExpressions"
                              | "thermalIndicators"
                              | "allDetections",
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="allDetections">
                          All Detections (Combined)
                        </option>
                        <option value="fall">Fall Detection Only</option>
                        <option value="tussle">Tussle Detection Only</option>
                        <option value="pacing">Pacing Only</option>
                        <option value="erraticMovements">
                          Erratic Movements Only
                        </option>
                        <option value="armFlailing">Arm Flailing Only</option>
                        <option value="facialExpressions">
                          Facial Expressions Only
                        </option>
                        <option value="thermalIndicators">
                          Thermal Indicators Only
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Min Camera Uptime (%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.minUptimeFilter}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            minUptimeFilter: Number(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">
                        {filters.minUptimeFilter}%
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Alert Severity
                      </label>
                      <select
                        value={filters.alertSeverityFilter}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            alertSeverityFilter: e.target.value as
                              | "all"
                              | "critical"
                              | "high"
                              | "medium"
                              | "low",
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm"
                      >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical Only</option>
                        <option value="high">High Only</option>
                        <option value="medium">Medium Only</option>
                        <option value="low">Low Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Camera Filter
                      </label>
                      <select
                        value={filters.cameraFilter}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            cameraFilter: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm"
                      >
                        <option value="all">All Cameras</option>
                        {cameraPerformance.map((cam) => (
                          <option key={cam.camera} value={cam.camera}>
                            {cam.camera}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Detection Count Range */}
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Min Detection Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={filters.minDetectionCount}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            minDetectionCount: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Max Detection Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={filters.maxDetectionCount}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            maxDetectionCount: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm"
                      />
                    </div>{" "}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setFilters({
                        includeMetrics: true,
                        includeDetectionTrends: true,
                        includeAlerts: true,
                        includeCameraPerformance: true,
                        includeHourlyActivity: true,
                        includeWeeklyComparison: true,
                        minUptimeFilter: 0,
                        alertSeverityFilter: "all",
                        cameraFilter: "all",
                        dateRange: {
                          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                            .toISOString()
                            .split("T")[0],
                          end: new Date().toISOString().split("T")[0],
                        },
                        detectionTypeFilter: "all",
                        minDetectionCount: 0,
                        maxDetectionCount: 1000,
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
