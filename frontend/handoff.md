# Handoff

## 変更ファイル
- `frontend/src/features/seed/hooks/useSeedRealtime.ts`（新規）

## 変更内容
- `useSeedRealtime(seedId)` フックを新規作成
- `seedId` が undefined の場合は early return（購読しない）
- チャンネル名 `seed-detail-${seedId}` で Supabase Realtime チャンネルを作成
- seeds テーブル UPDATE を購読し、受信時に `queryClient.setQueryData(['seed', seedId])` でキャッシュを直接更新（`Partial<SeedWithDetails>` でスプレッド）
- louges テーブル UPDATE を同一チャンネルに `.on()` チェーンで購読し、`status === 'published'` の場合のみ `queryClient.invalidateQueries({ queryKey: ['louges'] })` を実行
- アンマウント時に `supabase.removeChannel(channel)` でクリーンアップ
- `useEffect` 依存配列: `[seedId, queryClient]`

## 注意事項
- `frontend/src/features/seed/` ディレクトリはこのファイルの作成時点で新規作成（`hooks/` サブディレクトリ含む）
- `getBrowserClient()` はシングルトンのため、useEffect 内で毎回呼び出しても同一インスタンスを返す
- `payload.new` の型は Supabase が `Record<string, unknown>` として提供するため、`Partial<SeedWithDetails>` および `{ status?: string }` でアサーションしている
