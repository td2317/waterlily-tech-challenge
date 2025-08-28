// src/lib/auth.ts
const KEY = "token";

export function setToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(KEY);
}

export function clearToken() {
  localStorage.removeItem(KEY);
}