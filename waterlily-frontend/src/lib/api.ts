// src/lib/api.ts
import { getToken } from "./auth";

export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:3000";

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try{
          const e = await res.json();
          if(e?.error || e?.message) msg = e.error || e.message();
      } catch {}
      throw new Error(msg);
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}