# Unit of Work Story Map — Works Logue

## ストーリーマッピング概要

| ユニット | 担当ストーリー数 | 高優先度 | 中・低優先度 |
|---|---|---|---|
| backend | 30 | 22 | 8 |
| frontend | 30 | 22 | 8 |

> **Note**: 全ストーリーは Frontend + Backend の両ユニットで実装されます。
> Backend でAPI・ビジネスロジックを実装し、Frontend でUI・インタラクションを実装します。

---

## エピック別 ストーリー → ユニット マッピング

### EP0: 非ログインユーザーの閲覧体験

| ストーリー ID | タイトル | Backend 実装 | Frontend 実装 | 優先度 |
|---|---|---|---|---|
| US-000 | Seed 一覧の閲覧（非ログイン） | GET /seeds（認証不要） | SeedFeedPage（FC-02）、非ログイン表示 | 高 |
| US-001 | Louge 一覧・詳細の閲覧（非ログイン） | GET /louges, GET /louges/{id} | LougeListPage（FC-06）、LougeDetailPage（FC-07） | 高 |

---

### EP1: 登録・認証フロー

| ストーリー ID | タイトル | Backend 実装 | Frontend 実装 | 優先度 |
|---|---|---|---|---|
| US-101 | メール登録 | AuthMiddleware（BC-01）、profiles テーブル初期化 | AuthProvider（FC-01）、Register ページ | 高 |
| US-102 | Google ソーシャルログイン | Supabase Auth OAuth 設定 | AuthProvider（FC-01）、Google ボタン | 中 |
| US-103 | プロフィール設定 | PUT /users/me（BC-05）| ProfilePage（FC-08）、プロフィール編集フォーム | 高 |

---

### EP2: Seed 投稿フロー

| ストーリー ID | タイトル | Backend 実装 | Frontend 実装 | 優先度 |
|---|---|---|---|---|
| US-201 | Seed タイプ選択と投稿 | POST /seeds（BC-02）、SeedRepository | SeedFormPage（FC-04）、8タイプ対応ステップフォーム | 高 |
| US-202 | Seed へのタグ付け | tags / seed_tags テーブル、タグ CRUD | タグ選択 UI（FC-04 内） | 高 |
| US-203 | AI 知恵洗浄（リアルタイム） | POST /seeds/cleanse（BC-02）、AIService（BC-08） | デバウンス呼び出し（FC-04 内） | 中 |
| US-204 | Seed 一覧フィードの閲覧 | GET /seeds?stage=&tag=（BC-02）| SeedFeedPage（FC-02）、フィルタ UI | 高 |

---

### EP3: Log 対話フロー

| ストーリー ID | タイトル | Backend 実装 | Frontend 実装 | 優先度 |
|---|---|---|---|---|
| US-301 | Seed へのログ投稿 | POST /seeds/{id}/logs（BC-03）、GrowthEngine（BC-07）、ScoreEngine（BC-09）| LogThread（FC-05）、投稿フォーム | 高 |
| US-302 | Log への返信（スレッド） | POST /logs/{id}/replies（BC-03） | LogThread（FC-05）、スレッドネスト表示 | 中 |
| US-303 | Log へのリアクション | POST /logs/{id}/reactions（BC-03） | LogThread（FC-05）、リアクションボタン | 低 |
| US-304 | 成長ステージのリアルタイム表示 | Supabase DB 更新 → Realtime チャネル | GrowthIndicator（FC-09）、Supabase Realtime 購読 | 高 |
| US-305 | 開花間近の参加促進通知 | GrowthEngine 80% 判定 → NotificationService | NotificationDropdown（FC-10） | 中 |
| US-306 | Log 投稿者・タイムスタンプの表示 | logs テーブルに user_id・created_at | LogThread（FC-05）、アバター・日時表示 | 高 |

---

### EP4: Louge 開花体験

| ストーリー ID | タイトル | Backend 実装 | Frontend 実装 | 優先度 |
|---|---|---|---|---|
| US-401 | 開花判定の自動実行 | GrowthEngine（BC-07）: Log POST 時に同期チェック | — （バックエンドのみ） | 高 |
| US-402 | AI Louge 生成と公開 | AIService（BC-08）: BackgroundTask で Vertex AI 呼び出し→ Louge 保存・通知 | LougeDetailPage（FC-07）、Supabase Realtime で公開通知受信 | 高 |
| US-403 | Louge 生成中の状態表示 | louges.status = "blooming" | SeedDetailPage（FC-03）: status ポーリング / Realtime 表示 | 高 |
| US-404 | Louge ページの閲覧 | GET /louges/{id}（BC-04） | LougeDetailPage（FC-07）| 高 |
| US-405 | Louge 一覧・検索 | GET /louges?tag=&q=（BC-04） | LougeListPage（FC-06）| 高 |
| US-406 | 開花貢献者の表示 | louge_contributors テーブル、GET /louges/{id} に含む | LougeDetailPage（FC-07）、貢献者一覧 | 高 |

---

### EP5: Fork（再播種）フロー

| ストーリー ID | タイトル | Backend 実装 | Frontend 実装 | 優先度 |
|---|---|---|---|---|
| US-501 | Louge から Fork して Seed 作成 | POST /louges/{id}/fork（BC-04）: parent_louge_id 自動付与 | LougeDetailPage（FC-07）: Fork ボタン → SeedFormPage（FC-04）| 高 |
| US-502 | 派生 Seed の表示 | GET /louges/{id}（fork_seeds 含む） | LougeDetailPage（FC-07）: 派生 Seed セクション | 高 |
| US-503 | Fork Seed から親 Louge へのリンク | seeds.parent_louge_id → GET /seeds/{id} に含む | SeedDetailPage（FC-03）: 親 Louge バナー表示 | 高 |

---

### EP6: インサイト・スコアとバッジ

| ストーリー ID | タイトル | Backend 実装 | Frontend 実装 | 優先度 |
|---|---|---|---|---|
| US-601 | インサイト・スコアの自動計算 | ScoreEngine（BC-09）: 各アクション完了時に加算 | ProfilePage（FC-08）: スコア表示 | 高 |
| US-602 | 開花貢献者バッジの付与 | ScoreEngine（BC-09）: Louge 生成完了時にバッジ付与 | ProfilePage（FC-08）: バッジ一覧 | 高 |
| US-603 | プロフィールでのスコア・バッジ・貢献履歴表示 | GET /users/{id}/profile（BC-05） | ProfilePage（FC-08）: 全セクション | 高 |
| US-604 | スコアの詳細ブレークダウン | GET /users/{id}/score-history（BC-05） | ProfilePage（FC-08）: スコア詳細展開 | 中 |

---

### EP7: 通知・エンゲージメント

| ストーリー ID | タイトル | Backend 実装 | Frontend 実装 | 優先度 |
|---|---|---|---|---|
| US-701 | Seed への新規 Log 通知 | NotificationService（BC-06）: Log POST 時に Seed 投稿者へ通知作成 | NotificationDropdown（FC-10）: Supabase Realtime 受信 | 中 |
| US-702 | Louge 開花通知（貢献者へ） | NotificationService（BC-06）: Louge 公開時に貢献者全員へ通知 | NotificationDropdown（FC-10）: Supabase Realtime 受信 | 中 |

---

## ストーリー数サマリー（全 30）

| 優先度 | Backend | Frontend | 合計 |
|---|---|---|---|
| 高 | 22 | 22 | 22（共通） |
| 中 | 7 | 7 | 7（共通） |
| 低 | 1 | 1 | 1（共通） |
| **合計** | **30** | **30** | **30** |

> 全ストーリーが両ユニットに割り当て済み。未割り当てストーリーなし。
