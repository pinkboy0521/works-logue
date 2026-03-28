# Services — Works Logue

## サービス層の役割

FastAPI の Router（HTTP層）と Repository（DB層）の間を取り持つビジネスロジック層。
各 Router は対応する Service を呼び出し、Service は Repository を通じて DB にアクセスする。

```
Router → Service → Repository → Supabase DB
           ↕
       AIService → Vertex AI
       ScoreEngine
       NotificationService
```

---

## SeedService

**目的**: Seed の作成・取得・フィルタリングのオーケストレーション

**責務**:
- Seed の CRUD 操作
- タグ・業種・ステージによるフィルタリングクエリの組み立て
- 知恵洗浄リクエストを AIService に委譲
- Seed 作成時の ScoreEngine への通知（Seed投稿ポイント付与）

- フォロー / アンフォロー操作（低優先度、`seed_follows` テーブルの INSERT / DELETE）

**依存サービス**: AIService, ScoreEngine, SeedRepository

---

## LogService

**目的**: Log 投稿・スレッド管理のオーケストレーション

**責務**:
- Log / 返信の作成・取得
- リアクションの追加・集計
- Log 投稿後に GrowthEngine の `check_and_advance()` を呼び出す
- Log 投稿者へのスコア付与を ScoreEngine に委譲
- Seed 投稿者への通知を NotificationService に委譲

**依存サービス**: GrowthEngine, ScoreEngine, NotificationService, LogRepository

---

## GrowthEngine（Service）

**目的**: Seed の成長ステージ管理と開花判定

**責務**:
- Log 投稿のたびに開花条件（Log数・参加者数・多様性スコア）を同期チェック
- ステージ進行条件を満たした場合に Seed の stage を DB 更新
- 開花条件（Louge 生成トリガー）を満たした場合:
  - Seed のステータスを「開花中（blooming）」に更新
  - `AIService.generate_louge()` を BackgroundTask として登録（非同期実行）
- 多様性スコアの計算（異なる業種・ロールのContributor比率）

**開花判定基準（設定値）**:
- Log 数: 10件以上
- ユニーク参加者数: 5名以上
- 多様性スコア: 0.6 以上（詳細は Functional Design で定義）

**依存サービス**: AIService（BackgroundTask）, LogRepository, SeedRepository

---

## AIService

**目的**: Vertex AI（Gemini）との統合・AI処理のカプセル化

**責務**:

### Louge 生成（非同期）
- Seed の情報と全 Log を取得し、Gemini へのプロンプトを構築
- Vertex AI API を呼び出して Wikipedia 型記事を生成
- 生成結果を Louge テーブルに保存しステータスを「公開」に更新
- `ScoreEngine.award_bloom_contributors()` を呼び出し
- `NotificationService.notify_bloom_contributors()` を呼び出し

### 知恵洗浄
- 入力テキストを Gemini に送り固有名詞（社名・人名）を検知
- 抽象化候補テキストを返却（ユーザーが確認・承認）

**認証**: Google Cloud IAM（Service Account）。API キー不要。

**依存サービス**: ScoreEngine, NotificationService, LougeRepository, SeedRepository, LogRepository

---

## ScoreEngine（Service）

**目的**: インサイト・スコアとバッジの計算・付与

**スコアルール（暫定 — Functional Design で確定）**:
| アクション | ポイント |
|---|---|
| Seed 投稿 | +10 |
| Log 投稿 | +5 |
| Log へのリアクション獲得 | +2 |
| Louge 開花（Seed投稿者） | +50 |
| Louge 開花（上位Log貢献者） | +30 |

**バッジルール**:
- 「開花貢献者」バッジ: Louge 開花に貢献した全員に付与

**責務**:
- スコア加算イベントの記録（score_events テーブル）
- ユーザーの総スコア更新
- バッジ付与条件の評価と付与

**依存サービス**: UserRepository, ScoreRepository

---

## NotificationService

**目的**: アプリ内通知の生成・配信

**通知種別**:
| トリガー | 受信者 | メッセージ |
|---|---|---|
| 自分のSeedに新規Log | Seed 投稿者 | 「[名前]さんがLogを投稿しました」 |
| 自分が貢献したSeedが開花 | 全貢献者 | 「[Seed]が開花しました！」 |
| 開花間近（80%達成） | 未参加ユーザー（タグ一致） | 「開花間近のSeedがあります」 |

**責務**:
- notifications テーブルへのレコード挿入
- Supabase Realtime を通じたリアルタイム配信（DB INSERT → クライアント購読）

**依存サービス**: NotificationRepository

---

## LougeService

**目的**: Louge の取得・検索・ステータス管理

**責務**:
- Louge の取得・一覧・キーワード/タグ検索
- Louge のステータス管理（生成中/公開/アーカイブ）
- 開花貢献者一覧の取得（Seed投稿者 + 上位Log投稿者）
- 派生 Seed 一覧の取得

**依存サービス**: LougeRepository, SeedRepository

---

## ForkService

**目的**: Fork（再播種）の作成と親子関係の管理

**責務**:
- Fork Seed の作成（親 Louge ID を自動付与）
- Fork 作成時のスコア加算（Seed 投稿と同様）
- 親 Louge の「派生Seed数」カウント更新

**依存サービス**: SeedService, ScoreEngine, LougeRepository
