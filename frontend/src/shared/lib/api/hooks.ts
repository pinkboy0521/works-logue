"use client";

import { useUser } from "@auth0/nextjs-auth0/client";

// クライアントサイド用のAPI フック
export function useApiClient() {
  const { user } = useUser();

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error("API_BASE_URL is not configured");
    }

    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // v4正式版では /api/auth/access-token エンドポイントでトークンを取得
      const tokenResponse = await fetch("/api/auth/access-token");

      if (!tokenResponse.ok) {
        throw new Error("Failed to get access token");
      }

      const { accessToken } = await tokenResponse.json();

      const headers = new Headers(options.headers);
      headers.set("Authorization", `Bearer ${accessToken}`);
      headers.set("Content-Type", "application/json");

      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // ログインページにリダイレクト
        window.location.href =
          "/auth/login?audience=https://api.works-logue.dev";
        throw new Error("Unauthorized - redirecting to login");
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  };

  return { fetchWithAuth };
}
