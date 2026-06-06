import { API_BASE_URL } from "@/shared/api/client";

export function getSafeImageUrl(photo: string | undefined | null): string {
  if (!photo || photo === "undefined" || photo === "null") return "";
  if (typeof photo !== "string") return "";
  if (/^https?:\/\//i.test(photo)) return photo;
  const trimmed = photo.trim();
  if (!trimmed) return "";
  return photo.startsWith("/storage/v1/object/public/")
    ? `${API_BASE_URL}${trimmed}`
    : `${API_BASE_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}