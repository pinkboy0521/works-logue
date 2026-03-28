# Business Rules — Unit 1: backend

## BR-01: 開花条件（2段階ロック解除方式）

| ルール ID | BR-01 |
|---|---|
| カテゴリ | GrowthEngine |
| 優先度 | 必須 |

Louge 生成（開花）には **条件A AND 条件B** の両方が必要。

### 条件A：構造の成立（パターンランゲージ的視点）

AI が Log 全体を読み取り、以下の**4パーツが揃っているか**を評価する。

| パーツ | 内容 | 重み |
|---|---|---|
| 状況（Context） | どのような前提条件・環境で起きるか | 20% |
| 問題（Problem） | どのジレンマ・障害が発生するか | 25% |
| 解決策（Solution） | 具体的な行動・仕組み | 35% |
| パターン名（Name） | AIがこの一連のノウハウに名前を付けられる状態か | 20% |

```
structural_completeness = context * 0.20 + problem * 0.25 + solution * 0.35 + nameable * 0.20
```

| 閾値 | 環境変数 | デフォルト |
|---|---|---|
| structural_completeness | `BLOOM_STRUCTURAL_THRESHOLD` | 0.8 |
| ユーザー Log 数 | `BLOOM_LOG_COUNT` | 10 件 |
| ユニーク参加者数 | `BLOOM_PARTICIPANT_COUNT` | 5 名 |

**評価タイミング**: Log POST のたびに AI が軽量チェックを実行（同期、seeds.structural_completeness を更新）

### 条件B：品質スコア突破（集団知性の成熟度）

条件A達成時に AI が4観点で本格スコアリング（非同期 BackgroundTask）。

| 観点 | 内容 | 重み |
|---|---|---|
| 網羅度（Comprehensiveness） | 原因・対策・予防策など複数視点の俯瞰 | 20% |
| 多様性（Diversity） | 異なる背景・業種・役割の参加者がいるか | 20% |
| 反論・例外（Counterarguments） | 「失敗した」「逆効果になるケース」が含まれるか | **35%** ★重要 |
| 具体性（Specificity） | 明日から実行できるアクションが抽出可能か | 25% |

```
quality_score = comprehensiveness * 0.20 + diversity * 0.20 + counterarguments * 0.35 + specificity * 0.25
```

| 閾値 | 環境変数 | デフォルト |
|---|---|---|
| quality_score | `BLOOM_QUALITY_SCORE` | 0.7 |

**スコア達成**: `seeds.status = "blooming"` → AIService.generate_louge() を BackgroundTask 登録

**スコア未達**: AI ファシリテーション Log を自動投稿（最も低い観点に対して問いかけ）→ ユーザーが応答 → 次の Log POST で再評価

**付帯ルール**:
- `seeds.status == "active"` のときのみ本格スコアリングを起動（二重起動防止）
- 同一 Seed への同一 facilitation_type の AI ファシリテーション Log は 1 件まで

---

## BR-02: 開花間近通知条件（Near-Bloom Notification）

| ルール ID | BR-02 |
|---|---|
| カテゴリ | GrowthEngine / NotificationService |
| 優先度 | 必須 |

**ルール定義**:
`stage が growth → near_bloom` に変化した時（構造条件 + 参加条件が揃った瞬間）に 1 回だけ BLOOM_NEAR 通知を送信する。

near_bloom への遷移条件:
- structural_completeness >= BLOOM_STRUCTURAL_THRESHOLD（0.8）
- user_log_count >= BLOOM_LOG_COUNT（10）
- participant_count >= BLOOM_PARTICIPANT_COUNT（5）

**通知対象（Phase 1）**: 以下の **いずれか** に該当するユーザー（重複除外）
1. Seed 投稿者をフォローしているユーザー（`follows` テーブルで followee_id = seed.user_id）
2. その Seed をフォローしているユーザー（`seed_follows` テーブルで seed_id = seed.id）

**付帯ルール**:
- ステージが `growth → near_bloom` に変化した時のみ 1 回送信（重複送信しない）
- 通知対象ユーザーが 0 名の場合は通知をスキップ（エラーにしない）
- Seed 投稿者本人には送信しない（自己通知除外）

---

## BR-03: 多様性スコア計算ルール（AI 評価）

| ルール ID | BR-03 |
|---|---|
| カテゴリ | GrowthEngine |
| 優先度 | 必須 |

**ルール定義**:
多様性スコアは条件B の品質スコアリング（本格評価）の一観点として AI が評価する。
Log 内容・投稿者の階層タグ（industry / role）の両方を総合的に判断する。

**入力データ（AI プロンプトに渡す構造）**:
品質スコアリング時、参加者の `user_tags` を階層タグとして構造化して AI に提供する:
```json
[
  {
    "user_id": "...",
    "industry_tags": ["IT・テクノロジー", "SaaS"],
    "role_tags": ["営業", "法人営業"]
  },
  {
    "user_id": "...",
    "industry_tags": ["製造業", "自動車"],
    "role_tags": ["製造管理"]
  }
]
```

**評価基準（AI へのガイドライン）**:
- 同一 level=1 業界・職種の参加者のみ → 低スコア
- 異なる level=1 業界・職種から複数参加 → 高スコア
- `user_tags` 未設定でも Log 内容から多様性を推測して評価可

**段階的改善方針**:
- Phase 1: AI が Log 内容 + 階層タグを総合評価
- Phase 2: Log の意味的埋め込みベクトルのコサイン多様性を加味

---

## BR-04: ステージ進行ルール

| ルール ID | BR-04 |
|---|---|
| カテゴリ | GrowthEngine |
| 優先度 | 必須 |

| ステージ | 意味 | 進行条件 |
|---|---|---|
| seed | 投稿直後（Log なし） | 初期状態 |
| sprout | Log が来始めた | user_log_count >= 1 |
| growth | 構造が形成されつつある | structural_completeness >= 0.5 |
| near_bloom | 本格評価ループに突入 | structural_completeness >= BLOOM_STRUCTURAL_THRESHOLD AND user_log_count >= BLOOM_LOG_COUNT AND participant_count >= BLOOM_PARTICIPANT_COUNT |
| flowering | Louge AI 生成中 | seeds.status が "blooming" に変化（quality_score >= BLOOM_QUALITY_SCORE） |
| bloomed | 開花完了 | Louge 公開完了後（AIService が設定） |

**付帯ルール**:
- ステージは一方向のみ進行（後退しない）
- `near_bloom` は AI ファシリテーションループ中も維持（quality_score 未達でも near_bloom のまま）
- `bloomed` は最終ステージ
- ステージ判定は Log POST のたびに再計算（AI ファシリテーション Log への返信も含む）

---

## BR-05: スコアポイントルール

| ルール ID | BR-05 |
|---|---|
| カテゴリ | ScoreEngine |
| 優先度 | 必須 |

| アクション | ポイント | 付与タイミング |
|---|---|---|
| Seed 投稿 | +10 | POST /seeds 完了後 |
| Log 投稿 | +5 | POST /seeds/{id}/logs 完了後 |
| リアクション獲得 | +2 | POST /logs/{id}/reactions 完了後（Log 投稿者に付与）|
| Louge 開花（Seed投稿者） | +50 | Louge 公開完了後 |
| Louge 開花（Log 貢献者） | +30 | Louge 公開完了後 |

**付帯ルール**:
- Seed 投稿者が Log も投稿していた場合、開花時は `LOUGE_BLOOM_AUTHOR (+50)` のみ付与（+30との重複なし）
- スコアは非負整数（0以上）
- スコアの取り消し・マイナスは Phase 1 スコープ外

---

## BR-06: バッジ付与ルール

| ルール ID | BR-06 |
|---|---|
| カテゴリ | ScoreEngine |
| 優先度 | 必須 |

| バッジ | 付与条件 | 付与タイミング |
|---|---|---|
| bloom_contributor | Louge 開花に貢献した全員（Seed投稿者 + Log貢献者） | Louge 公開完了後 |

**付帯ルール**:
- 同一 Louge に対するバッジは 1 人に 1 回のみ（重複付与しない）
- バッジは `reference_id = louge_id` で個別管理

---

## BR-07: 知恵洗浄ルール

| ルール ID | BR-07 |
|---|---|
| カテゴリ | AIService |
| 優先度 | 推奨 |

**ルール定義**:
- 洗浄チェックボタン押下時のみ実行（自動実行しない）
- 検出対象の固有名詞カテゴリ: 社名、人名、製品名、プロジェクト名
- 抽象化候補はユーザーが個別に承認/却下（強制置換しない）
- AI 処理失敗時はエラーを返さず「洗浄候補なし」として扱う（投稿ブロックしない）
- 洗浄処理のログは保存しない（プライバシー考慮）

---

## BR-08: Seed フォームバリデーションルール

| ルール ID | BR-08 |
|---|---|
| カテゴリ | SeedRouter / Pydantic |
| 優先度 | 必須 |

| フィールド | ルール |
|---|---|
| type | SeedType の 8 種から必須 |
| title | 必須、1〜200 文字 |
| content | 必須、1〜2000 文字 |
| tags | 任意、最大 5 個、各タグ最大 50 文字 |

**全タイプでフォームフィールドは共通**（タイプ固有フィールドなし）

---

## BR-09: ページネーションルール

| ルール ID | BR-09 |
|---|---|
| カテゴリ | 全 Router |
| 優先度 | 必須 |

**方式**: オフセットベース（シンプルさ優先）

| パラメータ | デフォルト | 最大値 |
|---|---|---|
| `page` | 1 | — |
| `per_page` | 20 | 100 |

```
offset = (page - 1) * per_page
SQL: SELECT ... LIMIT per_page OFFSET offset
```

レスポンス形式:
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "per_page": 20,
  "total_pages": 8
}
```

---

## BR-10: 通知既読ルール

| ルール ID | BR-10 |
|---|---|
| カテゴリ | NotificationRouter |
| 優先度 | 必須 |

| API | 動作 |
|---|---|
| `PUT /notifications/{id}/read` | 指定通知を既読（is_read=true）に更新 |
| `PUT /notifications/read-all` | 認証ユーザーの全未読通知を一括既読 |

**付帯ルール**:
- 他ユーザーの通知を既読にしようとした場合は 403 Forbidden を返す
- 既読済みの通知に対して再度既読 PUT を行っても 200 OK を返す（べき等）

---

## BR-11: Seed 公開範囲ルール

| ルール ID | BR-11 |
|---|---|
| カテゴリ | SeedRouter |
| 優先度 | 必須 |

- 全 Seed は公開（非ログインユーザーでも GET /seeds, GET /seeds/{id} を実行可能）
- 非公開機能は Phase 1 スコープ外

---

## BR-12: Fork 可能条件

| ルール ID | BR-12 |
|---|---|
| カテゴリ | LougeRouter / ForkService |
| 優先度 | 必須 |

- Fork は `louges.status == "published"` の Louge のみ可能
- Fork は認証済みユーザーのみ実行可能
- Fork で生成される Seed の `parent_louge_id` は Fork 元 Louge の ID

---

## BR-13: 認証ルール

| ルール ID | BR-13 |
|---|---|
| カテゴリ | AuthMiddleware |
| 優先度 | 必須 |

| エンドポイント種別 | 認証要否 |
|---|---|
| GET /seeds, GET /seeds/{id} | 不要（非ログイン閲覧可） |
| GET /louges, GET /louges/{id} | 不要（非ログイン閲覧可） |
| その他の POST / PATCH / PUT / DELETE | 必須（Supabase JWT 検証） |

- JWT 検証失敗時: 401 Unauthorized を返す
- 他ユーザーリソースの変更試行: 403 Forbidden を返す

---

## ルール一覧サマリー

| ルール ID | 名称 | カテゴリ |
|---|---|---|
| BR-01 | 開花条件 | GrowthEngine |
| BR-02 | 開花間近通知条件 | GrowthEngine / Notification |
| BR-03 | 多様性スコア計算 | GrowthEngine |
| BR-04 | ステージ進行 | GrowthEngine |
| BR-05 | スコアポイント | ScoreEngine |
| BR-06 | バッジ付与 | ScoreEngine |
| BR-07 | 知恵洗浄 | AIService |
| BR-08 | Seedバリデーション | SeedRouter |
| BR-09 | ページネーション | 全Router |
| BR-10 | 通知既読 | NotificationRouter |
| BR-11 | Seed公開範囲 | SeedRouter |
| BR-12 | Fork可能条件 | LougeRouter |
| BR-13 | 認証 | AuthMiddleware |
