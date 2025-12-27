"use client";

import { useApiClient } from "@/shared/lib/api/hooks";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState } from "react";

export default function Dashboard() {
  const { user, error, isLoading } = useUser();
  const { fetchWithAuth } = useApiClient();
  const [apiResult, setApiResult] = useState<{
    success: boolean;
    data?: unknown;
    error?: string;
  } | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const testApiCall = async () => {
    setApiLoading(true);
    setApiResult(null);

    try {
      const response = await fetchWithAuth("/me");
      const data = await response.json();
      setApiResult({ success: true, data });
    } catch (error) {
      setApiResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setApiLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                こんにちは、{user?.name}さん
              </span>
              <a
                href="/auth/logout"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                ログアウト
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  ユーザー情報
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    ログインが成功しました。以下はAuth0から取得したユーザー情報です。
                  </p>
                </div>
                <div className="mt-4">
                  <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  API テスト
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>認証付きでAPIエンドポイント /me を呼び出します。</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={testApiCall}
                    disabled={apiLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {apiLoading ? "APIテスト中..." : "APIテスト実行"}
                  </button>
                </div>

                {apiResult && (
                  <div className="mt-4">
                    <div
                      className={`p-4 rounded-md ${
                        apiResult.success ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      <h4 className="font-medium">
                        {apiResult.success
                          ? "✅ APIテスト成功"
                          : "❌ APIテスト失敗"}
                      </h4>
                      <pre className="mt-2 text-xs overflow-auto">
                        {JSON.stringify(apiResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
