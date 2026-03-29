# Handoff: Step 7 認証フィーチャー

## 変更ファイル
- `frontend/src/features/auth/components/AuthProvider.tsx`（新規）
- `frontend/src/app/(auth)/layout.tsx`（新規）
- `frontend/src/app/providers.tsx`（更新）

## 変更内容

### `frontend/src/features/auth/components/AuthProvider.tsx`（新規）
- `'use client'` directive 付きの Client Component として実装
- `getBrowserClient()` で Supabase クライアント取得
- `useEffect` 内で `supabase.auth.getSession()` を呼び出し初期セッションを `userAtom` に反映
- `supabase.auth.onAuthStateChange` で認証状態変化を購読（SIGNED_IN / TOKEN_REFRESHED → userAtom 更新、SIGNED_OUT → userAtom を null + `queryClient.clear()`）
- 第 2 の `useEffect` でログイン中のみ Realtime チャネル `notifications:{userId}` を購読し、INSERT イベントで `notificationUnreadCountAtom` を `prev + 1` でインクリメント
- cleanup で `subscription.unsubscribe()` および `supabase.removeChannel(channel)` を呼び出し
- `mapSessionUser` ヘルパー関数で Supabase session.user → User 型へマップ（username 等未取得フィールドはデフォルト値で補完）

### `frontend/src/app/(auth)/layout.tsx`（新規）
- `'use client'` directive 付きの Client Component として実装
- `useAtomValue(userAtom)` でユーザー状態取得
- `useEffect` 内で user が存在する場合に `router.replace('/seeds')` でリダイレクト
- リダイレクト中（user 存在時）は `null` を返す
- 未認証ユーザーには `bg-background` + 全画面中央配置レイアウトでコンテンツを表示
- カラートークンは `bg-background` のみ使用、hex/rgb 直書きなし

### `frontend/src/app/providers.tsx`（更新）
- TODO コメントと仮実装の `AuthProvider` を削除
- `@/features/auth/components/AuthProvider` からの named import に差し替え

## 実装上の判断
- `mapSessionUser` は `/users/me` API を叩かず session.user.id のみマップする簡易実装とした（仕様記載の通り）
- Realtime チャネルの setup は async のため Promise を変数に保持し、cleanup で `then` チェーンにより channel を取得して `removeChannel` を呼び出す構造とした
