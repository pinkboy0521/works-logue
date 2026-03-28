# Functional Design Plan — Unit 1: backend

## 実行概要

| 項目 | 内容 |
|---|---|
| ユニット | backend |
| フェーズ | CONSTRUCTION — Functional Design |
| 目的 | ビジネスロジック・ドメインモデル・ビジネスルールの詳細設計 |

---

## 実行ステップ

- [x] Step 1: ドメインエンティティ定義（Domain Entities）
  - [x] Seed エンティティ（フィールド・制約・Enum定義）
  - [x] Log エンティティ（フィールド・リレーション）
  - [x] Louge エンティティ（フィールド・ステータス遷移）
  - [x] User / Profile エンティティ
  - [x] Notification エンティティ（種別・状態）
  - [x] ScoreEvent / Badge エンティティ
  - [x] Tag エンティティ

- [x] Step 2: ビジネスロジックモデル（Business Logic Models）
  - [x] GrowthEngine ロジック（開花条件判定・ステージ進行アルゴリズム）
  - [x] AIService ロジック（Louge生成フロー・知恵洗浄フロー）
  - [x] ScoreEngine ロジック（スコア計算・バッジ付与条件）
  - [x] NotificationService ロジック（通知生成ルール）
  - [x] ForkService ロジック（Fork作成・親子関係管理）

- [x] Step 3: ビジネスルール定義（Business Rules）
  - [x] 開花条件の閾値ルール
  - [x] 多様性スコア計算ルール
  - [x] スコアルール（アクション別ポイント）
  - [x] バッジ付与ルール
  - [x] 知恵洗浄ルール（どの種別の固有名詞を対象とするか）
  - [x] ページネーションルール（方式・デフォルト件数）

- [x] Step 4: データフロー定義（Data Flow）
  - [x] Log投稿 → GrowthEngine → （開花）→ AIService 非同期フロー
  - [x] Louge生成完了 → ScoreEngine + NotificationService フロー
  - [x] Fork作成フロー
  - [x] 知恵洗浄フロー

- [x] Step 5: 成果物ファイル生成
  - [x] `domain-entities.md`
  - [x] `business-logic-model.md`
  - [x] `business-rules.md`

---

## 明確化が必要な質問

以下の質問に回答してください。`[Answer]:` タグの後に回答を記入してください。

---

### Q1: Seed タイプ（8種類）の定義

Seed には 8 種類のタイプがあると設計されていますが、具体的なタイプ名と各タイプが持つ固有フィールドを教えてください。

例: 「技術メモ（tech-note）」「課題（problem）」「アイデア（idea）」など。各タイプでフォームの入力フィールドが変わりますか？

[Answer]:- 疑問（Query）
- 悩み（Pain）
- 失敗（Failure）
- 仮説（Hypothesis）
- 比較（Comparison）
- 違和感（Observation）
- シェア（Knowledge）
- 実践報告（Practice）
フォームの入力フィールドはいったん共通。

---

### Q2: 多様性スコア（Diversity Score）の計算方法

GrowthEngine の開花条件に「多様性スコア 0.6 以上」とあります。この多様性スコアはどのように計算しますか？

A) 異なる `industry`（業種）を持つ貢献者の比率（例: 5名中3名が異なる業種 → 3/5 = 0.6）
B) 異なる `role`（役割）を持つ貢献者の比率
C) 業種 + ロールの両方を組み合わせた指標
D) その他（ここは総合的に判断したい。業種・役割もそうだし、ログの内容も含めて判断する。個々のロジックはやりながら改善していきたい。）

[Answer]:D

---

### Q3: 開花間近の通知（80%）の判定基準

「開花間近通知」は「80%達成」時に送ると定義されています。この 80% の具体的な計算方法を教えてください。

A) 3条件（Log数・参加者数・多様性スコア）それぞれが閾値の80%以上で通知
B) 3条件のうち最も重要な1つ（例: Log数）が80%以上で通知
C) 3条件の達成度を平均して80%以上で通知
D) その他（記述してください）

[Answer]:A

---

### Q4: 上位Log貢献者（Louge開花報酬対象）の選定方法

Louge 開花時に `ScoreEngine.award_bloom_contributors()` が呼ばれ「上位Log貢献者」にスコアが付与されます。「上位」の選定基準を教えてください。

A) Log投稿数が多い上位 N 名（N は固定値、例: 上位5名）
B) Seed 投稿者以外の全貢献者
C) Log 投稿者全員（上位という概念なし）
D) その他（これも一つのLogueに対して、Logの内容がどれくらい貢献したかをＡＩで計算したい。）

[Answer]:D

---

### Q5: 開花条件の設定値（環境変数 vs ハードコード）

開花条件の閾値（Log数: 10件, 参加者: 5名, 多様性スコア: 0.6）は：

A) 環境変数で設定可能にする（`BLOOM_LOG_COUNT=10` 等）
B) `config.py` にハードコードする（PoCのため固定値でよい）
C) DB設定テーブルで管理する（将来的なUI設定を見据えて）

[Answer]:A

---

### Q6: DBスキーマにおける `stage` と `status` の使い分け

`seeds` テーブルに `stage`（成長ステージ）と `status`（状態）の 2 フィールドを想定していますが：

- `stage`: 成長フェーズ（例: seed / sprout / growth / flowering / bloomed）の段階
- `status`: 処理状態（例: active / blooming / archived）の管理用

この理解で正しいですか？または別の使い分けがありますか？

A) 上記の理解で正しい
B) `stage` のみで管理する（`status` は不要）
C) `status` のみで管理する（`stage` は `status` の値で表現）
D) 別の使い分けがある（記述してください）

[Answer]:A
---

### Q7: 知恵洗浄のUXフロー

知恵洗浄（Wisdom Cleanse）の処理タイミングと UI フローを教えてください。

A) 入力中にデバウンスで自動呼び出し → 置換候補をインラインで表示（リアルタイム）
B) 「洗浄チェック」ボタンを押した時のみ呼び出し → モーダルで候補表示
C) 投稿ボタン押下後に呼び出し → 確認ステップを挟んでから最終投稿
D) その他（記述してください）

[Answer]:B

---

### Q8: ページネーション方式

API のページネーション方式を教えてください。

A) オフセットベース（`page=1&per_page=20`）— シンプルだが大量データ時に不安定
B) カーソルベース（`cursor=xxx&limit=20`）— 大規模データに適するが複雑
C) どちらでもよい（PoCのためシンプルさ優先）

[Answer]:C

---

### Q9: 通知の既読更新 API

通知既読の操作方法を教えてください。

A) 個別既読: `PUT /notifications/{id}/read`
B) 全件一括既読: `PUT /notifications/read-all`
C) A + B 両方実装
D) 既読管理は不要（POC スコープ外）

[Answer]:C

---

### Q10: Seed の公開範囲

Seed の公開範囲設定は必要ですか？

A) 全Seedは公開（非ログインでも閲覧可）— シンプル
B) 投稿者が公開/非公開を選択可能
C) フェーズ1では全公開、将来的に非公開オプションを追加

[Answer]:A

---

## 次のステップ

全質問に回答後、以下の成果物を生成します：

1. `aidlc-docs/construction/backend/functional-design/domain-entities.md`
2. `aidlc-docs/construction/backend/functional-design/business-logic-model.md`
3. `aidlc-docs/construction/backend/functional-design/business-rules.md`
