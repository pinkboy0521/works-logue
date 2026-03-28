# Domain Entities — Unit 1: backend

## エンティティ一覧

| エンティティ | テーブル名 | 概要 |
|---|---|---|
| User | profiles | ユーザープロフィール・スコア管理 |
| Seed | seeds | 知恵の種（投稿・成長管理） |
| TaxonomyType | taxonomy_types | タグ種別マスタ（seed_topic / industry / role） |
| Tag | tags | 階層タグ（Seed トピック・業界・職種を統合管理） |
| SeedTag | seed_tags | Seed ↔ Tag の中間テーブル |
| UserTag | user_tags | User ↔ Tag（業界・職種タグ）の中間テーブル |
| Log | logs | Seed へのログ（コメント・返信） |
| LogReaction | log_reactions | Log へのリアクション |
| Louge | louges | AI 生成 Wikipedia 型記事 |
| LougeContributor | louge_contributors | Louge 開花貢献者（AI 貢献度スコア付き） |
| ScoreEvent | score_events | スコア加算イベント履歴 |
| Badge | badges | バッジ付与履歴 |
| Notification | notifications | アプリ内通知 |
| Follow | follows | ユーザー → ユーザーのフォロー関係 |
| SeedFollow | seed_follows | ユーザー → Seed のフォロー関係 |

---

## 列挙型（Enum）定義

### SeedType（Seed の 8 タイプ）

```python
class SeedType(str, Enum):
    QUERY       = "query"        # 疑問
    PAIN        = "pain"         # 悩み
    FAILURE     = "failure"      # 失敗
    HYPOTHESIS  = "hypothesis"   # 仮説
    COMPARISON  = "comparison"   # 比較
    OBSERVATION = "observation"  # 違和感
    KNOWLEDGE   = "knowledge"    # シェア
    PRACTICE    = "practice"     # 実践報告
```

### GrowthStage（Seed の 6 段階成長ステージ）

```python
class GrowthStage(str, Enum):
    SEED       = "seed"       # 初期（投稿直後）
    SPROUT     = "sprout"     # 発芽（Log 投稿始まった）
    GROWTH     = "growth"     # 成長中
    NEAR_BLOOM = "near_bloom" # 開花間近（80% 閾値達成）
    FLOWERING  = "flowering"  # 開花中（AI 生成中）
    BLOOMED    = "bloomed"    # 開花済み（Louge 公開完了）
```

### SeedStatus（Seed の処理状態）

```python
class SeedStatus(str, Enum):
    ACTIVE   = "active"    # 通常状態
    BLOOMING = "blooming"  # AI Louge 生成中
    ARCHIVED = "archived"  # アーカイブ済み
```

### LougeStatus（Louge の状態）

```python
class LougeStatus(str, Enum):
    GENERATING = "generating"  # AI 生成中
    PUBLISHED  = "published"   # 公開済み
    ARCHIVED   = "archived"    # アーカイブ済み
```

### ScoreAction（スコアアクション種別）

```python
class ScoreAction(str, Enum):
    SEED_POST             = "seed_post"              # Seed 投稿: +10pt
    LOG_POST              = "log_post"               # Log 投稿: +5pt
    REACTION_RECEIVED     = "reaction_received"      # リアクション獲得: +2pt
    LOUGE_BLOOM_AUTHOR    = "louge_bloom_author"      # 開花（Seed投稿者）: +50pt
    LOUGE_BLOOM_CONTRIBUTOR = "louge_bloom_contributor"  # 開花（貢献者）: +30pt
```

### BadgeType（バッジ種別）

```python
class BadgeType(str, Enum):
    BLOOM_CONTRIBUTOR = "bloom_contributor"  # 開花貢献者バッジ
    # 将来拡張用スロット
```

### NotificationType（通知種別）

```python
class NotificationType(str, Enum):
    NEW_LOG      = "new_log"      # 自分のSeedに新規Log
    LOUGE_BLOOMED = "louge_bloomed"  # 貢献したSeedが開花
    BLOOM_NEAR   = "bloom_near"   # 開花間近（タグ一致ユーザーへ）
```

---

## エンティティ詳細

### User（profiles テーブル）

```python
class User:
    id: UUID                    # Supabase Auth の user_id と一致
    username: str               # ユニーク、URLスラグ用
    display_name: str           # 表示名
    avatar_url: Optional[str]   # プロフィール画像 URL（Supabase Storage）
    bio: Optional[str]          # 自己紹介（最大 500 文字）
    total_score: int            # 累計インサイト・スコア（default: 0）
    created_at: datetime
    updated_at: datetime
```

**注**: 業種・職種は `user_tags` テーブル（taxonomy_type: industry / role）で管理。
`profiles` に文字列フィールドとしては持たない。

**制約**:
- `username`: NOT NULL, UNIQUE, 正規表現 `^[a-z0-9_-]{3,30}$`
- `display_name`: NOT NULL, 最大 100 文字
- `bio`: 最大 500 文字
- `total_score`: NOT NULL, DEFAULT 0, CHECK >= 0

---

### Seed（seeds テーブル）

```python
class Seed:
    id: UUID
    user_id: UUID               # 投稿者 (FK → profiles.id)
    type: SeedType              # 8タイプのいずれか
    title: str                  # タイトル（最大 200 文字）
    content: str                # 本文（最大 2000 文字）
    stage: GrowthStage          # 成長ステージ（DEFAULT: seed）
    status: SeedStatus          # 処理状態（DEFAULT: active）
    structural_completeness: float   # 条件A進捗（0.0〜1.0, DEFAULT: 0.0）
    quality_score: Optional[float]   # 条件B スコア（NULL=未評価）
    pattern_analysis: Optional[dict] # AI構造分析結果 JSONB（NULL=未分析）
    parent_louge_id: Optional[UUID]  # Fork元Louge（FK → louges.id）
    created_at: datetime
    updated_at: datetime
```

**制約**:
- `title`: NOT NULL, 1〜200 文字
- `content`: NOT NULL, 1〜2000 文字
- `stage`: NOT NULL, DEFAULT 'seed'
- `status`: NOT NULL, DEFAULT 'active'
- `structural_completeness`: NOT NULL, DEFAULT 0.0, BETWEEN 0.0 AND 1.0
- `parent_louge_id`: NULL許容（Fork Seed の場合のみ設定）

**pattern_analysis JSONB 構造**:
```json
{
  "context_score": 0.85,
  "problem_score": 0.90,
  "solution_score": 0.60,
  "nameable_score": 0.70,
  "evaluated_at": "2026-03-28T10:00:00Z"
}
```

**ステージ遷移ルール**:

| 遷移 | 条件 | トリガー |
|---|---|---|
| seed → sprout | log_count >= 1 | Log POST |
| sprout → growth | structural_completeness >= 0.5 | Log POST（GrowthEngine 軽量チェック）|
| growth → near_bloom | structural_completeness >= BLOOM_STRUCTURAL_THRESHOLD AND log_count >= BLOOM_LOG_COUNT AND participant_count >= BLOOM_PARTICIPANT_COUNT | Log POST（GrowthEngine 軽量チェック）|
| near_bloom → flowering | quality_score >= BLOOM_QUALITY_SCORE（seeds.status が blooming に変化） | GrowthEngine 本格スコアリング |
| near_bloom → near_bloom | quality_score < BLOOM_QUALITY_SCORE → AI ファシリテーション Log 投稿 | GrowthEngine 本格スコアリング |
| flowering → bloomed | Louge 公開完了 | AIService BackgroundTask |

---

### TaxonomyType（taxonomy_types テーブル）

```python
class TaxonomyType:
    id: UUID
    code: str           # 識別コード: "seed_topic" | "industry" | "role"
    display_name: str   # 表示名（例: "Seedトピック", "業界", "職種"）
    description: Optional[str]
    sort_order: int     # DEFAULT 0
    created_at: datetime
    updated_at: datetime
```

**制約**:
- `code`: NOT NULL, UNIQUE
- `display_name`: NOT NULL

**初期データ（マスタ）**:
| code | display_name | 用途 |
|---|---|---|
| `seed_topic` | Seedトピック | Seed のコンテンツ分類タグ |
| `industry` | 業界 | ユーザープロフィールの業界分類 |
| `role` | 職種 | ユーザープロフィールの職種分類 |

---

### Tag（tags テーブル）

```python
class Tag:
    id: UUID
    name: str                   # タグ名（例: "マーケティング"）
    description: Optional[str]
    taxonomy_type_id: UUID      # FK → taxonomy_types.id
    parent_id: Optional[UUID]   # FK → tags.id（NULL = ルートタグ）
    level: int                  # 階層レベル（1=大分類, 2=中分類, 3=小分類）
    sort_order: int             # DEFAULT 0
    created_at: datetime
    updated_at: datetime
```

**制約**:
- `name`: NOT NULL, 最大 50 文字
- UNIQUE (parent_id, name)（同一親の下で名前重複不可）
- `level`: NOT NULL, CHECK IN (1, 2, 3)
- `taxonomy_type_id`: NOT NULL

**インデックス**:
- `(taxonomy_type_id, level, sort_order)` — 種別・階層での絞り込み
- `parent_id` — 子タグ取得

**タグ階層例（seed_topic）**:
```
営業（level=1）
  └── 新規開拓（level=2）
        └── テレアポ（level=3）
```

**タグ階層例（industry）**:
```
IT・テクノロジー（level=1）
  └── SaaS（level=2）
        └── 営業支援ツール（level=3）
```

**タグ階層例（role）**:
```
営業（level=1）
  └── 法人営業（level=2）
        └── エンタープライズ営業（level=3）
```

---

### SeedTag（seed_tags テーブル）

```python
class SeedTag:
    seed_id: UUID   # FK → seeds.id
    tag_id: UUID    # FK → tags.id（taxonomy_type.code = "seed_topic" のみ）
```

**制約**:
- PRIMARY KEY (seed_id, tag_id)
- 1つの Seed に最大 5 タグ
- 参照できる Tag は `taxonomy_type.code = "seed_topic"` のみ（アプリ層で制御）

---

### UserTag（user_tags テーブル）

```python
class UserTag:
    id: UUID
    user_id: UUID   # FK → profiles.id
    tag_id: UUID    # FK → tags.id（taxonomy_type.code = "industry" or "role"）
    created_at: datetime
```

**制約**:
- UNIQUE (user_id, tag_id)
- 参照できる Tag は `taxonomy_type.code IN ("industry", "role")` のみ（アプリ層で制御）
- 1ユーザーあたり industry タグ最大 3 件、role タグ最大 3 件（アプリ層で制御）

**多様性スコアへの活用**:
- GrowthEngine の品質スコアリング時、参加者の `user_tags`（industry / role）を取得
- AI に構造化データとして渡すことで多様性評価の精度が向上
  ```json
  {
    "user_id": "...",
    "industry_tags": ["IT・テクノロジー", "SaaS"],
    "role_tags": ["営業", "法人営業"]
  }
  ```

---

### Log（logs テーブル）

```python
class Log:
    id: UUID
    seed_id: UUID               # 対象Seed（FK → seeds.id）
    user_id: UUID               # 投稿者（FK → profiles.id）
    parent_log_id: Optional[UUID]  # 返信先Log（FK → logs.id）NULL = トップレベル
    content: str                # ログ内容（最大 1000 文字）
    is_ai_facilitation: bool    # AI ファシリテーション Log フラグ（DEFAULT: false）
    facilitation_type: Optional[str]  # ファシリテーション種別（NULL = 通常Log）
    created_at: datetime
```

**制約**:
- `content`: NOT NULL, 1〜1000 文字
- `parent_log_id`: NULL = トップレベル Log、設定時 = 返信 Log
- 返信の深さ: 最大 2 階層（返信への返信まで）
- `is_ai_facilitation`: NOT NULL, DEFAULT false
- `facilitation_type`: NULL許容、値は "need_counterargument" | "need_specificity" | "need_comprehensiveness" | "need_diversity"

**AI ファシリテーション Log の特徴**:
- `user_id` は システムアカウント（`SYSTEM_USER_ID` 環境変数で定義）
- UI 上は「Works Logue AI」として表示、バッジで区別
- スコア付与・リアクション集計の対象外

---

### LogReaction（log_reactions テーブル）

```python
class LogReaction:
    id: UUID
    log_id: UUID        # FK → logs.id
    user_id: UUID       # リアクションしたユーザー（FK → profiles.id）
    reaction_type: str  # "insight" | "agree" | "helpful"
    created_at: datetime
```

**制約**:
- UNIQUE (log_id, user_id, reaction_type)（同一ユーザーが同一Logに同一リアクション重複不可）

---

### Louge（louges テーブル）

```python
class Louge:
    id: UUID
    seed_id: UUID           # 元となった Seed（FK → seeds.id）
    pattern_name: str       # AI命名したパターン名（例: "0→1営業責任者の泥臭さ要件"）
    title: str              # AI生成タイトル（最大 300 文字）
    content: str            # AI生成本文（パターンランゲージ形式の Wikipedia 型記事）
    pattern_context: str    # 状況（Context）セクション
    pattern_problem: str    # 問題（Problem）セクション
    pattern_solution: str   # 解決策（Solution）セクション
    status: LougeStatus     # DEFAULT: generating
    quality_score: float    # 最終的な品質スコア（Condition B）
    fork_count: int         # 派生Seed数（DEFAULT: 0）
    created_at: datetime
    published_at: Optional[datetime]  # 公開日時
```

**制約**:
- `pattern_name`, `title`, `content`: NOT NULL（生成後）
- `pattern_context`, `pattern_problem`, `pattern_solution`: NOT NULL（生成後）
- `status`: NOT NULL, DEFAULT 'generating'
- `fork_count`: NOT NULL, DEFAULT 0, CHECK >= 0

**記事構造（パターンランゲージ形式）**:
```
## パターン名
{pattern_name}

## 状況（Context）
{どのような前提条件・環境で起きる事象か}

## 問題（Problem）
{そこで発生するジレンマ・障害}

## 解決策（Solution）
{具体的な行動・仕組み・アクション}

## 例外・反論
{このパターンが逆効果になるケース}

## 網羅的解説
{背景・原因・対策・予防策の俯瞰}

## 明日から使えるアクション
{読んだ人が即実行できるステップ}
```

---

### LougeContributor（louge_contributors テーブル）

```python
class LougeContributor:
    louge_id: UUID              # FK → louges.id
    user_id: UUID               # FK → profiles.id
    role: str                   # "seed_author" | "log_contributor"
    contribution_score: float   # AI算出貢献度スコア（0.0〜1.0）
    log_count: int              # 当該Seedへの投稿Log数
```

**制約**:
- PRIMARY KEY (louge_id, user_id)
- `contribution_score`: NOT NULL, DEFAULT 0.0, BETWEEN 0.0 AND 1.0

---

### ScoreEvent（score_events テーブル）

```python
class ScoreEvent:
    id: UUID
    user_id: UUID           # FK → profiles.id
    action: ScoreAction     # アクション種別
    reference_id: UUID      # 対象リソースのID（Seed/Log/Louge）
    points: int             # 加算ポイント
    created_at: datetime
```

**制約**:
- `points`: NOT NULL, CHECK > 0

---

### Badge（badges テーブル）

```python
class Badge:
    id: UUID
    user_id: UUID               # FK → profiles.id
    badge_type: BadgeType       # バッジ種別
    reference_id: Optional[UUID]  # 付与の起因リソース（Louge ID 等）
    awarded_at: datetime
```

---

### Follow（follows テーブル）

```python
class Follow:
    follower_id: UUID   # フォローする側（FK → profiles.id）
    followee_id: UUID   # フォローされる側（FK → profiles.id）
    created_at: datetime
```

**制約**:
- PRIMARY KEY (follower_id, followee_id)
- follower_id != followee_id（自己フォロー不可）

---

### SeedFollow（seed_follows テーブル）

```python
class SeedFollow:
    user_id: UUID   # フォローするユーザー（FK → profiles.id）
    seed_id: UUID   # フォロー対象 Seed（FK → seeds.id）
    created_at: datetime
```

**制約**:
- PRIMARY KEY (user_id, seed_id)

---

### Notification（notifications テーブル）

```python
class Notification:
    id: UUID
    user_id: UUID               # 受信者（FK → profiles.id）
    type: NotificationType      # 通知種別
    reference_id: UUID          # 関連リソースID（Seed/Louge）
    message: str                # 通知メッセージ（最大 200 文字）
    is_read: bool               # 既読フラグ（DEFAULT: false）
    created_at: datetime
```

**制約**:
- `message`: NOT NULL, 最大 200 文字
- `is_read`: NOT NULL, DEFAULT false

---

## エンティティ関係図（簡略）

```
taxonomy_types ──── tags ──── tags (parent hierarchy)
                      │
                      ├── seed_tags ──── seeds ──── logs ──── log_reactions
                      │                   │
                      │                   └── louges ──── louge_contributors ── profiles
                      │                         │
                      │                         └── (fork) seeds (parent_louge_id)
                      │
                      └── user_tags ──── profiles

profiles ──── score_events
profiles ──── badges
profiles ──── notifications
profiles ──── follows ──── profiles  (follower → followee)
profiles ──── seed_follows ──── seeds
```
