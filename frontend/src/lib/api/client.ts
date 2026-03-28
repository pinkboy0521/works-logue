'use client';

import { getBrowserClient } from "@/lib/supabase/browser-client";
import type { ApiError } from "@/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

async function getAccessToken(): Promise<string | null> {
  const supabase = getBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const apiError: ApiError = {
      code: String(res.status),
      message: (errorBody as { message?: string })?.message ?? res.statusText,
      details: errorBody as Record<string, unknown>,
    };
    throw apiError;
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>("GET", path, undefined, headers),

  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>("POST", path, body, headers),

  put: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>("PUT", path, body, headers),

  patch: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>("PATCH", path, body, headers),

  delete: <T>(path: string, headers?: Record<string, string>) =>
    request<T>("DELETE", path, undefined, headers),
};
