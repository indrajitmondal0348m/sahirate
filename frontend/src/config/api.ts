/**
 * SahiRate API & Environment Configuration
 * Provides normalized URLs for backend API and external portals (frontendRA).
 */

const rawApiUrl = (import.meta as any).env?.VITE_API_URL?.trim();

export const API_BASE_URL: string = rawApiUrl
  ? (rawApiUrl.endsWith("/api/v1")
      ? rawApiUrl
      : rawApiUrl.replace(/\/+$/, "") + (rawApiUrl.includes("/api/v1") ? "" : "/api/v1"))
  : "/api/v1";

/**
 * Normalizes an API path and returns the complete API URL.
 * Works seamlessly with relative proxies (/api/v1/...) or full cloud URLs (https://.../api/v1/...).
 * Example inputs:
 *  getApiUrl("/auth/login")      -> "https://backend.app/api/v1/auth/login" or "/api/v1/auth/login"
 *  getApiUrl("/api/v1/lots")     -> "https://backend.app/api/v1/lots" or "/api/v1/lots"
 *  getApiUrl("sync/events")      -> "https://backend.app/api/v1/sync/events" or "/api/v1/sync/events"
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.replace(/^\/?(api\/v1\/?)?/, "");
  return `${API_BASE_URL}/${cleanPath}`;
}

/**
 * External URL for Recycler & Admin Web Portal (frontendRA on Vercel).
 * Default deployed admin portal: https://sahirate-ra.vercel.app
 */
export const PORTAL_BASE_URL: string = (
  (import.meta as any).env?.VITE_PORTAL_URL?.trim() || "https://sahirate-ra.vercel.app"
).replace(/\/+$/, "");

export const ADMIN_PORTAL_URL: string = `${PORTAL_BASE_URL}/admin`;
