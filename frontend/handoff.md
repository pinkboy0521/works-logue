# Writer Handoff

## タスク
レビュー指摘 HI-01-残存・ME-01・ME-02・LW-01 の修正（frontend 5ファイル）

## 変更ファイル
- `frontend/src/middleware.ts` — `PROTECTED_PATTERNS`（正規表現配列）を廃止し `PROTECTED_PREFIXES`（文字列配列）に置換、`isProtectedPath` を `startsWith` ベースに書き換え、`PUBLIC_PATHS` の先行チェックを削除
- `frontend/src/store/atoms.ts` — `notificationUnreadCountAtom` を derived atom から `atom<number>(0)` の primitive atom に変更
- `frontend/src/lib/api/server.ts` — `import type { RequestOptions } from "./types"` と `import type { ApiError } from "./types"` を1行にまとめ
- `frontend/src/lib/api/client.ts` — 先頭の `"use client"` をシングルクォート `'use client'` に変更
- `frontend/src/lib/supabase/browser-client.ts` — シングルクォートのまま維持（変更なし）

## 修正した指摘
- HI-01-残存: 対応済み
- ME-01: 対応済み
- ME-02: 対応済み
- LW-01: 対応済み

## 未対応項目
なし

## 構文チェック結果
- `middleware.ts`: OK
- `atoms.ts`: OK
- `server.ts`: OK
- `client.ts`: OK
- `browser-client.ts`: OK（変更なし）

## テスト結果
（実行なし）
