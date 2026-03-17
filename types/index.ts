// Profile type matching the profiles table schema
export interface Profile {
  id: string;
  username: string;
  email: string;
  role?: "admin" | "user" | "manager";
  full_name: string;
  organization_logo?: string | null;
  organization_name?: string | null;
  organization_id: string ;
  created_at?: string;
  updated_at?: string;
  display_orgId?: string;
  organizations?: Organization
}

// Feature type matching the features table schema
export interface Feature {
  id: string;
  name: string;
  description: string;
  icon?: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  org_id: string;
  created_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  displayid?: string;
  description?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  created_at: string;
  user_count?: number;
}

export interface CameraConfig {
  id: number;
  name: string;
  status: "normal" | "warning" | "offline";
  detection: boolean;
  alert_sound: boolean;
  frame_rate: number;
  resolution: string;
  updated_at: string;
  url?: string; // Optional URL for RTSP/HTTP streams
  created_at?: string;
  organization_id: string | number;
  stream_url?: string;
}

export interface Snapshot {
  id: string;
  camera_id: number;
  camera_name: string;
  url: string;
  organization_id: string;
  created_at: string;
}

export interface CameraFolder {
  camera: CameraConfig;
  snapshotCount: number;
  latestSnapshot?: Snapshot;
}