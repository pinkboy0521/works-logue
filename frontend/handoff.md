# handoff.md

## 変更ファイル
- `frontend/src/features/log/hooks/useReactionMutation.ts`（修正）
- `frontend/src/features/log/hooks/useReplyMutation.ts`（修正）

## 変更内容
- `useReactionMutation.ts`: `'use client'` ディレクティブを削除
- `useReplyMutation.ts`: `'use client'` ディレクティブを削除、楽観的エントリのIDを `crypto.randomUUID()` に変更

## 設計上の注意点
- キャッシュキーは `['seed', seedId]`（単数形）。仕様記述の `['seeds', seedId]`（複数形）とは異なるが、SeedDetailPage.tsx の実装に合わせている
- `useReactionMutation` の引数シグネチャは `{ seedId }` のみで、`logId` は mutation 変数側（`ReactionMutationVariables`）に含まれる。仕様記述の `引数: { logId, seedId }` とは異なる設計
- `Log` 型に `my_reactions` フィールドが存在しないため、楽観的更新は `reaction_summary` カウントのみ更新（`my_reactions` 追加は未実装）
- 409エラー判定は `error.code === '409'`（文字列比較）。`ApiError.code` は `String(res.status)` で生成されるため整合している
- `useReplyMutation` の楽観的エントリの `user_id` は空文字列。呼び出し元で currentUser を注入する場合は修正が必要
