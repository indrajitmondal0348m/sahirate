import type {
  Lot,
  Handover,
  Payment,
  MaterialRate,
  AdminStats,
  AdminTransaction,
  VerificationRequest,
  AdminAlert,
  AuditLog,
  User,
  TokenResponse,
  RecyclerRegisterData,
} from "../types";

const BASE_URL = (import.meta as any).env?.VITE_API_URL || "/api/v1";

export function getStoredToken(): string | null {
  return localStorage.getItem("sahirate_token");
}

export function getStoredUser(): User | null {
  const str = localStorage.getItem("sahirate_user");
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export function setStoredSession(token: string, user: User) {
  localStorage.setItem("sahirate_token", token);
  localStorage.setItem("sahirate_user", JSON.stringify(user));
}

export function logoutUser() {
  localStorage.removeItem("sahirate_token");
  localStorage.removeItem("sahirate_user");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorDetail = `Request failed: ${response.statusText}`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // Ignore JSON parse failure
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

// 0. Auth API
export async function loginUser(phone: string, password: string): Promise<TokenResponse> {
  const res = await request<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  });
  setStoredSession(res.access_token, res.user);
  return res;
}

export async function registerRecycler(data: RecyclerRegisterData): Promise<any> {
  const payload = {
    phone: data.phone,
    password: data.password,
    full_name: data.contact_name || data.full_name || "Authorized Manager",
    organization_name: data.yard_name || data.organization_name || "Authorized Recycling Facility",
    address: data.city || data.location || data.address || "Industrial Area",
    pcb_license: data.spcb_license || data.pcb_license || "OD/SPCB/2026",
    location: data.city || data.location || "Bhubaneswar Hub",
    daily_capacity_kg: data.capacity_mt ? Math.round(data.capacity_mt * 33) : (data.daily_capacity_kg || 2500),
    facility_type: data.materials || "Metal & Plastic Dismantler",
    email: data.email || `yard-${data.phone}@sahirate.in`,
    gst_number: data.gst_number || "21AAACU1234F1Z5",
  };
  return request<any>("/auth/register-recycler", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe(): Promise<User> {
  return request<User>("/auth/me");
}

// 1. Lots API
export async function getLots(params?: { status?: string; recycler_id?: string }): Promise<Lot[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append("status", params.status);
  if (params?.recycler_id) searchParams.append("recycler_id", params.recycler_id);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request<Lot[]>(`/lots${query}`);
}

export async function getLotById(id: string): Promise<Lot> {
  return request<Lot>(`/lots/${id}`);
}

export async function acceptLot(lotId: string, recyclerId: string): Promise<Lot> {
  return request<Lot>(`/lots/${lotId}/accept`, {
    method: "POST",
    body: JSON.stringify({ recycler_id: recyclerId }),
  });
}

export async function makeOffer(
  lotId: string,
  recyclerId: string,
  offeredPrice: number,
  message?: string
): Promise<Lot> {
  return request<Lot>(`/lots/${lotId}/offer`, {
    method: "POST",
    body: JSON.stringify({
      recycler_id: recyclerId,
      offered_price: offeredPrice,
      message,
    }),
  });
}

export async function verifyLot(
  lotId: string,
  data: {
    recycler_id: string;
    verified_material: string;
    verified_weight_kg: number;
    final_rate: number;
    final_amount: number;
  }
): Promise<Lot> {
  return request<Lot>(`/lots/${lotId}/verify`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 2. Handovers API
export async function createHandover(data: {
  lot_id: string;
  recycler_id: string;
  verified_weight_kg: number;
  final_rate: number;
  final_amount: number;
}): Promise<Handover> {
  return request<Handover>("/handovers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getHandover(idOrRef: string): Promise<Handover> {
  return request<Handover>(`/handovers/${idOrRef}`);
}

export async function completeHandover(id: string): Promise<Handover> {
  return request<Handover>(`/handovers/${id}/complete`, {
    method: "POST",
  });
}

// 3. Payments API
export async function recordPayment(data: {
  handover_id: string;
  amount: number;
  payment_mode: "CASH" | "UPI" | "BANK";
}): Promise<Payment> {
  return request<Payment>("/payments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPayments(handoverId?: string): Promise<Payment[]> {
  const query = handoverId ? `?handover_id=${handoverId}` : "";
  return request<Payment[]>(`/payments${query}`);
}

// 4. Rates API
export async function getRates(): Promise<MaterialRate[]> {
  return request<MaterialRate[]>("/rates");
}

// 5. Admin API
export async function getAdminStats(): Promise<AdminStats> {
  return request<AdminStats>("/admin/stats");
}

export async function getAdminTransactions(params?: { status?: string; material?: string }): Promise<AdminTransaction[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append("status", params.status);
  if (params?.material) searchParams.append("material", params.material);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request<AdminTransaction[]>(`/admin/transactions${query}`);
}

export async function getAdminTransactionById(id: string): Promise<any> {
  return request<any>(`/admin/transactions/${id}`);
}

export async function getVerifications(status?: string): Promise<VerificationRequest[]> {
  const query = status ? `?status=${status}` : "";
  return request<VerificationRequest[]>(`/admin/verification${query}`);
}

export async function approveVerification(id: string): Promise<VerificationRequest> {
  return request<VerificationRequest>(`/admin/verification/${id}/approve`, {
    method: "POST",
  });
}

export async function rejectVerification(id: string): Promise<VerificationRequest> {
  return request<VerificationRequest>(`/admin/verification/${id}/reject`, {
    method: "POST",
  });
}

export async function getAdminAlerts(): Promise<AdminAlert[]> {
  return request<AdminAlert[]>("/admin/alerts");
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return request<AuditLog[]>("/admin/audit");
}

export const CURRENT_RECYCLER_ID = "demo-recycler-123";
