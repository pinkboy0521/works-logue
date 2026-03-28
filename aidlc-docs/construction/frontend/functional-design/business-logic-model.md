# Business Logic Model — Unit 2: frontend

## 概要

フロントエンドのビジネスロジックは以下のレイヤーで構成される。

```
Pages (app/)
  └── Feature Components (features/)
        ├── Custom Hooks（useXxx）— サーバー状態・API呼び出し
        └── UI Components — 純粋な表示

Global State
  ├── Jotai atoms — クライアント状態（認証セッション、モーダル開閉等）
  └── React Query cache — サーバー状態のキャッシュ

API Layer (lib/api.ts) — FastAPI クライアント
Realtime Layer (lib/supabase.ts) — Supabase Realtime 購読
```

---

## 1. 認証フロー（AuthProvider / FC-01）

### セッション管理ロジック

```
アプリ起動
  → supabase.auth.getSession() を呼び出し
  → セッションが存在: userAtom を設定 → 認証済み状態
  → セッションが存在しない: userAtom = null → 未認証状態

supabase.auth.onAuthStateChange() を購読
  → SIGNED_IN: userAtom を更新
  → SIGNED_OUT: userAtom = null → キャッシュクリア
  → TOKEN_REFRESHED: 透過的に処理（UI変化なし）
```

### ソーシャルログインフロー

```
ログインページ
  → 「Googleでログイン」ボタン
  → supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: window.location.origin + '/auth/callback' })
  → Supabase が Google OAuth フローを開始
  → /auth/callback ページで supabase.auth.exchangeCodeForSession()
  → セッション確立 → redirect クエリパラメータのURLへ遷移（または / へ）
```

---

## 2. SeedFeedPage のデータフロー（FC-02）

```
初期ロード
  → useInfiniteQuery(['seeds'], fetchSeeds, { page: 1, per_page: 20 })
  → GET /seeds?page=1&per_page=20
  → React Query がキャッシュ保存

無限スクロール
  → Intersection Observer が末尾要素を検出（200px前）
  → fetchNextPage() を呼び出し
  → GET /seeds?page=N&per_page=20
  → キャッシュに追加（append）

フィルタ（将来実装スロット）
  → クエリキー ['seeds', { stage, tag_id }] で分離キャッシュ
```

---

## 3. SeedFormPage のステップロジック（FC-04）

```
状態: { step: 1〜4, formData: SeedFormInput }

Step 1: タイプ選択
  → seedTypeAtom に選択値を保存
  → 「次へ」: step → 2

Step 2: 共通フィールド入力
  → title, content をリアルタイムでバリデーション
  → content 変更 → 800ms デバウンス → POST /seeds/cleanse
    → レスポンスを cleanse_suggestions に格納
    → インラインサジェスト表示
  → 「次へ」: バリデーション通過 → step → 3

Step 3: タグ付け
  → GET /tags?taxonomy_type=seed_topic（初回のみ、キャッシュ利用）
  → タグ選択 → tag_ids 配列に追加/削除（制限なし）
  → 「次へ」: step → 4

Step 4: 確認
  → formData を表示
  → 「投稿する」: POST /seeds（formData から payload 構築）
    → 成功 → /seeds/[id] へ遷移
    → 失敗 → トースト通知
```

---

## 4. SeedDetailPage のリアルタイムフロー（FC-03）

```
ページ表示
  → GET /seeds/{id}（Seed 情報取得）
  → GET /seeds/{id}/logs（Log 一覧取得）
  → GrowthIndicator に stage を渡す

Supabase Realtime 購読開始
  → channel: 'seed:{id}'
  → テーブル: 'seeds', フィルタ: 'id=eq.{id}', イベント: 'UPDATE'

Realtime イベント受信
  → SeedStageChangedEvent を受け取り
  → React Query の ['seed', id] キャッシュを更新（setQueryData）
  → GrowthIndicator が自動的に新ステージのアニメーションを表示

  → louges テーブルも購読
  → LougePublishedEvent 受信時: 「Louge が生成されました」トーストを表示
      → LougeDetailPage へのリンクをトーストに含める

ページ離脱
  → supabase.channel().unsubscribe() を呼び出し（クリーンアップ）
```

---

## 5. LogThread のインタラクションロジック（FC-05）

```
Log 一覧表示（ネスト構造）
  → トップレベル Log: parent_log_id === null
  → 返信 Log: parent_log_id === {親LogのID}
  → 最大2階層まで表示（返信への返信はインデント表示）

AI ファシリテーション Log の識別
  → is_ai_facilitation === true の場合
  → 「Works Logue AI」ラベル + 専用スタイル（区別表示）

Log 投稿
  → 「ログを追加」テキストエリア（SeedDetailPage に常駐）
  → POST /seeds/{id}/logs
  → 成功 → React Query キャッシュに楽観的更新（optimistic update）
  → サーバー確認後にキャッシュ再検証

返信
  → 「返信」ボタンクリック → 返信フォームをインライン展開
  → POST /logs/{id}/replies
  → 成功 → 親 Log の replies に楽観的追加

リアクション
  → リアクションボタン（insight / agree / helpful）クリック（絵文字なし、アイコン or テキストで表現）
  → POST /logs/{id}/reactions
  → 成功 → カウントを楽観的更新
  → 重複リアクション: API が 409 → トーストなし（UI は元に戻す）
```

---

## 6. LougeDetailPage のフォーク遷移（FC-07）

```
Fork ボタンクリック（ログイン済み + louge.status === 'published'）
  → POST /louges/{id}/fork
    → レスポンス: { seed_id: string, parent_louge_id: string }
  → 成功 → SeedFormPage へ遷移
    → URL: /seeds/new?from_louge={louge_id}&seed_id={seed_id}
    → SeedFormPage が seed_id を受け取り、既存 Seed を編集モードで開く
```

---

## 7. NotificationDropdown のリアルタイムロジック（FC-10）

```
ヘッダーマウント時
  → GET /notifications?is_read=false&per_page=20 → 未読件数バッジ更新
  → Supabase Realtime: notifications テーブルの INSERT を購読
    → フィルタ: user_id = eq.{current_user_id}
    → INSERT 受信 → unreadCount を+1、ローカルリストの先頭に追加

ドロップダウン開く
  → PUT /notifications/read-all → サーバー側で全件既読
  → ローカルの unreadCount = 0 に即時更新（楽観的）
  → React Query: ['notifications'] キャッシュを invalidate

ページ離脱
  → Realtime チャネルを unsubscribe
```

---

## 8. ProfilePage のデータ集約ロジック（FC-08）

```
GET /users/{userId}/profile
  → UserProfile（User + industry_tags + role_tags + badges）を取得

GET /users/{userId}/score-history（展開時のみ）
  → ScoreSummary を取得
  → プログレッシブロード（最初は total_score のみ表示）

自分のプロフィール編集（userId === current_user.id の場合）
  → PUT /users/me でプロフィール更新
  → 成功 → React Query の ['user', userId] キャッシュを invalidate
```

---

## 状態管理マップ（Jotai atoms）

| atom 名 | 型 | 用途 |
|---|---|---|
| `userAtom` | `User \| null` | 認証済みユーザー情報 |
| `sessionAtom` | `Session \| null` | Supabase セッション |
| `toastAtom` | `Toast[]` | グローバルトースト通知リスト |
| `seedFormAtom` | `SeedFormInput` | SeedFormPage の入力状態 |
| `notificationUnreadCountAtom` | `number` | 未読通知件数 |

---

## React Query キーマップ

| クエリキー | エンドポイント | キャッシュ戦略 |
|---|---|---|
| `['seeds']` | GET /seeds | infinite, staleTime: 30s |
| `['seed', id]` | GET /seeds/{id} | 5min stale, Realtime で無効化 |
| `['logs', seedId]` | GET /seeds/{id}/logs | 30s stale |
| `['louges']` | GET /louges | infinite, staleTime: 60s |
| `['louge', id]` | GET /louges/{id} | 5min stale |
| `['tags', taxonomyType]` | GET /tags?taxonomy_type= | 1h stale（マスタデータ）|
| `['user', id]` | GET /users/{id}/profile | 5min stale |
| `['notifications']` | GET /notifications | 1min stale, Realtime で無効化 |
