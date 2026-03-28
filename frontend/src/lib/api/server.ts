import { getServerClient } from "@/lib/supabase/server-client";
import type { RequestOptions, ApiError } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

async function getAccessToken(): Promise<string | null> {
  const supabase = await getServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    cache: options.cache ?? "no-store",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  if (options.revalidate !== undefined) {
    (fetchOptions as RequestInit & { next?: { revalidate?: number | false; tags?: string[] } }).next = {
      revalidate: options.revalidate,
      ...(options.tags ? { tags: options.tags } : {}),
    };
  }

  const res = await fetch(`${BACKEND_URL}${path}`, fetchOptions);

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

export const apiServer = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),

  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),

  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),

  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
};
