export interface Lot {
  id: string;
  collector_id?: string;
  collector_phone?: string;
  material_id: string;
  approx_weight_kg: number;
  total_weight_kg?: number;
  estimated_value: number;
  estimated_value_inr?: number;
  asking_price?: number;
  estimated_min?: number;
  estimated_max?: number;
  items?: Array<{ material: string; weight?: number; count?: number; rate?: number; value?: number; unit?: string }>;
  extra_data?: {
    items?: Array<{ material: string; weight?: number; count?: number; rate?: number; value?: number; unit?: string }>;
    asking_price?: number;
    estimated_min?: number;
    estimated_max?: number;
    offered_price?: number;
    offer_status?: string;
    recycler_id?: string;
    offer_message?: string;
    offered_at?: string;
    [key: string]: any;
  };
  photo_reference?: string;
  status: "AVAILABLE" | "ACCEPTED" | "PRICE_OFFERED" | "VERIFIED" | "QR_GENERATED" | "COLLECTOR_CONFIRMED" | "COMPLETED";
  accepted_by?: string;
  accepted_at?: string;
  recycler_verified_material?: string;
  recycler_weight_kg?: number;
  latitude?: number;
  longitude?: number;
  created_at_local?: string;
  synced_at?: string;
}

export interface Handover {
  id: string;
  lot_id: string;
  recycler_id: string;
  collector_id?: string;
  verified_weight_kg: number;
  final_rate: number;
  final_amount: number;
  status: "QR_GENERATED" | "COLLECTOR_CONFIRMED" | "COMPLETED";
  qr_reference: string;
  created_at_local?: string;
  collector_confirmed_at?: string;
  recycler_confirmed_at?: string;
  completed_at?: string;
  created_at?: string;
}

export interface Payment {
  id: string;
  handover_id: string;
  amount: number;
  payment_mode: "CASH" | "UPI" | "BANK";
  status: "PENDING" | "PAID" | "FAILED";
  paid_at?: string;
  created_at_local?: string;
  created_at?: string;
}

export interface MaterialRate {
  material_id: string;
  label: string;
  price_min: number;
  price_max: number;
  unit: string;
  unit_label: string;
  updated_at?: string;
}

export interface AdminStats {
  totalTransactions: number;
  activeCollectors: number;
  verifiedRecyclers: number;
  monthlyVolumeKg: number;
  totalWeightKg?: number;
  totalVolumeInr?: number;
  pendingVerifications: number;
  activeAlerts: number;
}

export interface AdminTransaction {
  id: string;
  lot_id: string;
  material: string;
  weight_kg: number;
  amount: number;
  final_amount?: number;
  estimated_value?: number;
  rate_per_kg: number;
  collector_id: string;
  recycler_id: string;
  status: string;
  qr_reference: string;
  payment_status: string;
  payment_mode: string;
  timestamp?: string;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  user_name: string;
  phone?: string;
  role: "RECYCLER" | "COLLECTOR";
  document_type: string;
  document_number?: string;
  facility_name?: string;
  location?: string;
  details?: {
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    gst_number?: string;
    pcb_license?: string;
    facility_type?: string;
    daily_capacity_kg?: number;
    location?: string;
    [key: string]: any;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  submitted_at?: string;
  reviewed_at?: string;
}

export interface User {
  id: string;
  phone: string;
  full_name?: string;
  role: "COLLECTOR" | "RECYCLER" | "ADMIN";
  is_active: boolean;
  is_verified: boolean;
  verification_status?: "PENDING" | "APPROVED" | "REJECTED";
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RecyclerRegisterData {
  phone: string;
  password: string;
  full_name?: string;
  contact_name?: string;
  organization_name?: string;
  yard_name?: string;
  email?: string;
  address?: string;
  gst_number?: string;
  spcb_license?: string;
  pcb_license?: string;
  facility_type?: string;
  daily_capacity_kg?: number;
  capacity_mt?: number;
  materials?: string;
  city?: string;
  location?: string;
}

export interface AdminAlert {
  id: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  entity_id?: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  created_at?: string;
}

export interface AuditLog {
  id: string;
  event_type: string;
  actor_id?: string;
  actor_role?: string;
  entity_id?: string;
  details?: any;
  timestamp?: string;
}
