# Business Logic Model — Unit 1: backend

## 1. GrowthEngine ロジック（2段階ロック解除方式）

### 1.1 概要

**2段階ロック解除方式**: Louge 生成には **条件A（構造の成立）AND 条件B（品質スコア突破）** の両方が必要。

- **条件A（軽量チェック）**: Log POST のたびに AI が「パターンランゲージの4パーツが埋まっているか」を評価（structural_completeness を更新）
- **条件B（本格スコアリング）**: 条件A + 最低参加条件を達成した時点で AI が品質の4観点を本格評価
- **AI ファシリテーション**: 条件B の評価が不足している観点に対し、AI が問いかけ Log を自動投稿して品質向上を促進

### 1.2 全体フロー（check_and_advance）

```
入力: seed_id, background_tasks

Step 1: 現在の Seed 状態取得
  - seed: Seed（status, stage, structural_completeness を含む）
  - log_count: 総Log数（AI ファシリテーション Log を含む）
  - user_log_count: ユーザー投稿Log数のみ（AI Log 除外）
  - participant_ids: ユニーク参加者（AI 除外）
  - participant_count: len(participant_ids)

Step 2: 軽量構造チェック（条件A）
  → lightweight_structural_check(seed_id) を呼び出す
  - 直近の Log が構造に何を追加したかを AI 評価（毎回実行）
  - seeds.structural_completeness を UPDATE
  - seeds.pattern_analysis (JSONB) を UPDATE

Step 3: ステージ判定・更新
  → determine_stage(seed, log_count, participant_count) を呼び出す
  - stage 変化があれば seeds.stage を UPDATE

Step 4: 開花トリガー判定
  - 本格スコアリング起動条件（全て満たす必要あり）:
    ① structural_completeness >= BLOOM_STRUCTURAL_THRESHOLD（default: 0.8）
    ② user_log_count >= BLOOM_LOG_COUNT（default: 10）
    ③ participant_count >= BLOOM_PARTICIPANT_COUNT（default: 5）
    ④ seeds.status == "active"（二重起動防止）

  [条件未達] → 現状のステージを維持して終了

  [条件達成] → Step 5 へ（本格スコアリングを BackgroundTask で実行）
    → seeds.stage = "near_bloom" に UPDATE
    → background_tasks.add_task(quality_scoring_and_bloom, seed_id)

出力: 更新後の GrowthStage
```

### 1.3 軽量構造チェック（lightweight_structural_check）

```
目的: Log 投稿のたびに「パターンランゲージの4パーツ」の充足度を AI が軽量評価

入力: seed_id

Step 1: Seed + 全Log（ユーザーのみ）を取得
Step 2: Vertex AI に軽量評価プロンプト送信
  指示: "以下のSeedと全Logを読み、ビジネスパターンとして必要な4要素がどれくらい揃っているか 0.0〜1.0 で評価してください"
  評価対象:
    - context_score:  状況（どのような環境・前提条件か）の充足度
    - problem_score:  問題（どのジレンマ・障害が発生しているか）の充足度
    - solution_score: 解決策（具体的な行動・仕組み）の充足度
    - nameable_score: パターン名を付けられる状態か（抽象化可能か）

Step 3: structural_completeness の計算
  # solution と nameable を重視（解決策が核心）
  structural_completeness = (
    context_score  * 0.20 +
    problem_score  * 0.25 +
    solution_score * 0.35 +
    nameable_score * 0.20
  )

Step 4: seeds テーブルを UPDATE
  - structural_completeness
  - pattern_analysis (JSONB): {context_score, problem_score, solution_score, nameable_score, evaluated_at}

エラーハンドリング:
  - AI 呼び出し失敗時: 前回値を維持（seeds の更新をスキップ）
```

### 1.4 ステージ判定関数（determine_stage）

```
閾値（環境変数から取得）:
  BLOOM_LOG_COUNT           = 10   (default) ※ユーザーLogのみカウント
  BLOOM_PARTICIPANT_COUNT   = 5    (default)
  BLOOM_STRUCTURAL_THRESHOLD = 0.8  (default)

ステージ判定ルール（上から優先評価）:
  if status == "blooming":                              return FLOWERING
  if structural >= BLOOM_STRUCTURAL_THRESHOLD
     AND user_log_count >= BLOOM_LOG_COUNT
     AND participant_count >= BLOOM_PARTICIPANT_COUNT:  return NEAR_BLOOM
  if structural >= 0.5:                                 return GROWTH
  if user_log_count >= 1:                               return SPROUT
  else:                                                 return SEED
```

### 1.5 本格スコアリング → 開花 or AI ファシリテーション（quality_scoring_and_bloom）

```
入力: seed_id（BackgroundTask として実行）

Step 1: Seed + 全Log（ユーザーのみ）取得
Step 2: Vertex AI に品質スコアリングプロンプト送信
  評価4観点（各 0.0〜1.0）:
    comprehensiveness: 原因・対策・予防策など複数視点が網羅されているか
    diversity:         異なる背景・業種・役割のユーザーが参加しているか
                       （Log内容 + user_tags の階層タグ構造データを総合評価）
    counterarguments:  「このやり方は失敗した」「例外ケース」が含まれているか ★最重要
    specificity:       明日から実行できるアクションが具体的に抽出可能か

  重み付きスコア:
    quality_score = (
      comprehensiveness * 0.20 +
      diversity         * 0.20 +
      counterarguments  * 0.35 +  ★重要度高
      specificity       * 0.25
    )

Step 3: スコア判定
  if quality_score >= BLOOM_QUALITY_SCORE（default: 0.7）:
    → [開花] seeds.status = "blooming" に UPDATE
    → background_tasks.add_task(ai_service.generate_louge, seed_id)

  else:
    → [AI ファシリテーション] 不足観点を特定し、AI ファシリテーション Log を投稿
    → seeds.quality_score を UPDATE（次回再評価の基準）
    → seeds.stage は near_bloom のまま維持（再び Log が来たら再評価）

Step 4: seeds.quality_score を UPDATE
```

### 1.6 AI ファシリテーション Log 生成

```
目的: 品質スコアが不足している観点を改善するため、AI が的確な問いかけを Log として投稿

入力: seed_id, quality_breakdown (各観点のスコア)

不足観点の特定（スコアが最も低い観点）:

  counterarguments < 0.4:
    facilitation_type = "need_counterargument"
    message = "素晴らしい解決策が集まっています。一方で、この手法を試して『逆効果だった』『うまくいかなかった』という経験をお持ちの方はいますか？"

  specificity < 0.4:
    facilitation_type = "need_specificity"
    message = "実践的な知見が集まっています。具体的に現場で使うフォーマット・ツール・キラークエスチョンの文言などを共有いただけますか？"

  comprehensiveness < 0.4:
    facilitation_type = "need_comprehensiveness"
    message = "この課題について、『再発防止策』や『そもそもこの状況を回避する方法』という視点での知見はありますか？"

  diversity < 0.4:
    facilitation_type = "need_diversity"
    message = "さまざまな業種・役割の方のLogが集まると、より普遍的な知恵になります。異なる業種・立場から見たこの課題への見解を歓迎します。"

logs テーブルに INSERT:
  - user_id: SYSTEM_USER_ID
  - is_ai_facilitation: true
  - facilitation_type: (上記の値)
  - content: (上記のメッセージ)

NOTE: 再評価タイミングは次回 Log POST 時（通常フローに乗る）
      同一 seed に対して同一 facilitation_type の Log は 1 件まで（重複投稿しない）
```

### 1.7 開花間近（near_bloom）通知トリガー

```
stage が growth → near_bloom に変化した時のみ 1 回送信:
  通知種別: BLOOM_NEAR
  通知対象（Phase 1）: 全登録ユーザー
  メッセージ: "開花間近のSeedがあります: 「{Seedタイトル}」"
```

---

## 2. AIService ロジック

### 2.1 Louge 生成フロー（BackgroundTask）

```
入力: seed_id

Step 1: データ収集
  - SeedRepository.get_seed_with_logs(seed_id)
    → Seed情報（タイトル・タイプ・本文・タグ・pattern_analysis）
    → 全ユーザー Log（本文・投稿者プロフィール・タイムスタンプ）
    　 ※ AI ファシリテーション Log は含めない（is_ai_facilitation=false のみ）
    → 参加者プロフィール（display_name, industry, role）

Step 2: Vertex AI プロンプト構築
  → build_louge_prompt(seed, logs, contributors) を呼び出す
  プロンプト構成:
    - システム指示: パターンランゲージ形式の Wikipedia 型記事生成
    - 必須出力セクション:
        ① パターン名（このノウハウを一言で表す固有名詞）
        ② 状況（Context）: どのような前提・環境で起きるか
        ③ 問題（Problem）: どのジレンマ・障害が発生するか
        ④ 解決策（Solution）: 具体的な行動・仕組み
        ⑤ 例外・反論: このパターンが逆効果になるケース（必須）
        ⑥ 網羅的解説: 背景・原因・対策・予防策の俯瞰
        ⑦ 明日から使えるアクション: 読んだ人が即実行できるステップ
    - Seed の問いかけ・タイプ・コンテキスト
    - 全ユーザー Log の全文（内容・投稿者業種/役割・タイムスタンプ）
    - JSON 形式で返却を指示

Step 3: Vertex AI Gemini API 呼び出し
  model = GenerativeModel("gemini-1.5-pro")
  response = model.generate_content(prompt)  # JSON mode

Step 4: Louge 保存
  - louges テーブルに INSERT:
    → seed_id, pattern_name, title, content
    → pattern_context, pattern_problem, pattern_solution
    → status="published", quality_score（seeds.quality_score から引き継ぎ）
  - seeds テーブルを UPDATE:
    → stage = "bloomed", status = "active"

Step 5: 貢献者スコア・バッジ付与
  - AI 貢献度スコア計算（同一レスポンス内に含める or 別プロンプト）
  - LougeContributor レコード一括 INSERT（AI貢献度スコア付き）
  - ScoreEngine.award_bloom_contributors(seed_id, louge_id) を呼び出す

Step 6: 通知送信
  - NotificationService.notify_louge_bloomed(seed_id, louge_id) を呼び出す

エラーハンドリング:
  - Vertex AI 呼び出し失敗時: seeds.status を "active" に戻し、
    stage は flowering のまま維持（再試行可能状態）
  - 最大リトライ: 3回（指数バックオフ）
```

### 2.2 AI 貢献度スコア計算

```
目的: 各 Log が Louge（最終記事）にどれだけ貢献したかを 0.0〜1.0 で評価

Phase 1 実装:
  Louge 生成完了後、別プロンプトで各Logの貢献度を評価リクエスト:
  - 入力: Louge content + 全 Log content
  - 出力: List[{log_id: UUID, contribution_score: float}]
  - スコアの合計が 1.0 になるよう正規化（softmax相当）

  ユーザー貢献度 = そのユーザーの全Logの contribution_score 合計

フォールバック（AI評価失敗時）:
  - 各ユーザーの log_count / total_logs で均等配分
```

### 2.3 知恵洗浄フロー

```
入力: text (ユーザー入力テキスト)

Step 1: Vertex AI Gemini にプロンプト送信
  指示:
    - 入力テキスト内の固有名詞（社名・人名・製品名・プロジェクト名）を検出
    - 各固有名詞に対して抽象化候補テキストを提案
    - JSON形式で返却

Step 2: レスポンスのパース
  出力形式:
    {
      "detected_terms": [
        {
          "original": "株式会社ABC",
          "suggestion": "某IT企業",
          "category": "company",
          "start_pos": 10,
          "end_pos": 16
        }
      ],
      "cleansed_text": "某IT企業での..."  # 全置換済みテキスト
    }

Step 3: レスポンスを WisdomCleanseResult として返却
  → フロントエンドがモーダルで置換候補を表示
  → ユーザーが個別に承認/却下

エラーハンドリング:
  - Vertex AI 失敗時: 空の detected_terms を返却（洗浄なしで継続可能）
```

---

## 3. ScoreEngine ロジック

### 3.1 スコア加算フロー

```
入力: user_id, action, reference_id

Step 1: アクションに対応するポイントを取得
  点数テーブル（config.py で定義）:
  | ScoreAction.SEED_POST              | +10 |
  | ScoreAction.LOG_POST               | +5  |
  | ScoreAction.REACTION_RECEIVED      | +2  |
  | ScoreAction.LOUGE_BLOOM_AUTHOR     | +50 |
  | ScoreAction.LOUGE_BLOOM_CONTRIBUTOR| +30 |

Step 2: score_events テーブルに INSERT
  → user_id, action, reference_id, points

Step 3: profiles.total_score を UPDATE
  → total_score += points（DB側でアトミック更新）

Step 4: バッジ評価を呼び出す
  → evaluate_and_award_badges(user_id) を呼び出す
  → 新規バッジが付与された場合は Badge を返却

出力: 更新後の total_score
```

### 3.2 Louge 開花時の一括スコア付与（award_bloom_contributors）

```
入力: seed_id, louge_id

Step 1: Seed の投稿者 ID を取得（seeds テーブル）
Step 2: LougeContributor テーブルから全貢献者を取得
Step 3: 各貢献者に対してスコア加算
  - Seed 投稿者: add_score(user_id, LOUGE_BLOOM_AUTHOR, louge_id)
  - Log 貢献者（Seed投稿者以外）: add_score(user_id, LOUGE_BLOOM_CONTRIBUTOR, louge_id)
    ※ Seed 投稿者が Log も投稿していた場合は AUTHOR 扱いのみ（重複付与なし）
Step 4: 開花貢献者全員に BLOOM_CONTRIBUTOR バッジを付与
```

### 3.3 バッジ付与評価（evaluate_and_award_badges）

```
入力: user_id

評価ルール（Phase 1）:
  - BLOOM_CONTRIBUTOR バッジ:
    → ScoreEvents に LOUGE_BLOOM_AUTHOR または LOUGE_BLOOM_CONTRIBUTOR のレコードが
      1件以上存在し、かつ badges テーブルに未付与の louge_id がある場合に付与

出力: 新規付与バッジのリスト（空リストも可）
```

---

## 4. NotificationService ロジック

### 4.1 通知生成ルール

```
トリガー1: 新規 Log 投稿（Log POST 完了後）
  送信対象: Seed の投稿者（log 投稿者が Seed 投稿者自身の場合は送信しない）
  通知種別: NEW_LOG
  message: "{log投稿者名}さんが「{Seedタイトル}」にLogを投稿しました"
  reference_id: seed_id

トリガー2: Louge 公開完了（AIService BackgroundTask 完了後）
  送信対象: 全 LougeContributor（Seed投稿者 + Log貢献者）
  通知種別: LOUGE_BLOOMED
  message: "「{Seedタイトル}」が開花し、Lougeが公開されました！"
  reference_id: louge_id

トリガー3: 開花間近（GrowthEngine が near_bloom ステージに進行させた時）
  送信対象: 以下の和集合（重複除外、Seed 投稿者本人を除く）
    - Seed 投稿者をフォローしているユーザー（follows.followee_id = seed.user_id）
    - その Seed をフォローしているユーザー（seed_follows.seed_id = seed.id）
  通知種別: BLOOM_NEAR
  message: "開花間近のSeedがあります: 「{Seedタイトル}」"
  reference_id: seed_id
  ※ 対象ユーザーが 0 名の場合は通知をスキップ
```

### 4.2 通知配信メカニズム

```
1. notifications テーブルに INSERT
2. Supabase が DB 変更を Realtime チャネルにブロードキャスト
3. フロントエンドの Supabase Realtime 購読が受信し、NotificationDropdown を更新
```

---

## 5. ForkService ロジック

```
入力: louge_id, fork_input, user_id

Step 1: Fork 元 Louge の存在確認（status == "published" のみ Fork 可）

Step 2: Fork Seed を作成
  - type: Louge に紐づく元 Seed の type をデフォルトとして提案
  - title: ユーザー入力
  - content: ユーザー入力（fork_input.initial_content）
  - parent_louge_id: louge_id
  - stage: seed（初期状態）
  - status: active

Step 3: louges.fork_count をインクリメント（fork_count += 1）

Step 4: ScoreEngine.add_score(user_id, SEED_POST, new_seed_id) を呼び出す

出力: 新規作成された Seed
```

---

## 6. データフロー図

### Log 投稿 → 2段階ロック解除 → Louge 公開

```
POST /seeds/{id}/logs （ユーザー投稿）
│
├─ [LogService]
│   ├─ logs テーブルに INSERT（is_ai_facilitation=false）
│   ├─ ScoreEngine.add_score(log_user, LOG_POST, log_id)
│   └─ NotificationService.notify_new_log(seed_id, log_user)
│
├─ [GrowthEngine.check_and_advance(seed_id, background_tasks)]  ← 同期
│   ├─ 軽量構造チェック（条件A）
│   │   └─ AIService.lightweight_structural_check(seed_id)
│   │       → seeds.structural_completeness 更新
│   │       → seeds.pattern_analysis (JSONB) 更新
│   ├─ ステージ判定・更新
│   │   ├─ stage 変化 → seeds.stage UPDATE
│   │   └─ growth→near_bloom 到達 → BLOOM_NEAR 通知送信
│   └─ 本格スコアリング起動条件チェック:
│       ① structural >= 0.8  ② user_log_count >= 10  ③ participants >= 5
│       [未達] → 終了
│       [達成] → seeds.stage = "near_bloom"
│            → background_tasks.add_task(quality_scoring_and_bloom, seed_id)
│
└─ Response: LogWithGrowthStage（同期返却）

[BackgroundTask: quality_scoring_and_bloom]  ← 非同期
├─ AIService: 品質4観点スコアリング（条件B）
│   comprehensiveness / diversity / counterarguments★ / specificity
├─ seeds.quality_score を UPDATE
│
├─ [スコア >= 0.7] → 開花!
│   ├─ seeds.status = "blooming"
│   └─ background_tasks.add_task(ai_service.generate_louge, seed_id)
│
└─ [スコア < 0.7] → AI ファシリテーション
    ├─ 最低スコア観点を特定
    └─ logs テーブルに INSERT（is_ai_facilitation=true）
        → ユーザーが応答 → 次の Log POST で再評価ループ

[BackgroundTask: AIService.generate_louge]  ← 非同期（開花時のみ）
├─ データ収集（ユーザーLogのみ）
├─ パターンランゲージ形式プロンプト構築
├─ Vertex AI Gemini API 呼び出し → JSON レスポンス
├─ louges テーブルに INSERT
│   （pattern_name, context, problem, solution, 例外・反論, 解説, アクション）
├─ seeds.stage = "bloomed", status = "active"
├─ LougeContributor INSERT（AI貢献度スコア付き）
├─ ScoreEngine.award_bloom_contributors(seed_id, louge_id)
└─ NotificationService.notify_louge_bloomed(seed_id, louge_id)
   └─ Supabase Realtime → Frontend 通知
```

### 知恵洗浄フロー

```
POST /seeds/cleanse  { text: "..." }
│
└─ [AIService.cleanse_wisdom(text)]
    ├─ Vertex AI プロンプト送信
    ├─ JSON レスポンスパース
    └─ WisdomCleanseResult 返却
       → Frontend がモーダルで候補表示
       → ユーザーが承認/却下
       → 確定テキストで Seed 投稿フォームに反映
```
