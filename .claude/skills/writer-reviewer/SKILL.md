# Writer/Reviewer ワークフロー（コンテキスト分離最適化版）

## 設計原則

メインコンテキストを汚染しないため、各フェーズをサブエージェントで実行し、**結果のみ**を親に返す。

```
メインコンテキスト（クリーン）
    │
    ├─ [並列] Explorer A: 仕様ドキュメント読み込み → 要約のみ返却（< 500字）
    ├─ [並列] Explorer B: 対象コード読み込み → 要約のみ返却（< 300字）
    │
    ├─ Writer: 要約を受け取りコード生成 → handoff.md のみ返却
    │
    └─ Reviewer: handoff.md + ファイルリスト → 構造化レポートのみ返却
```

## 使い方

```
/writer-reviewer <タスク説明>
```

例：
- `/writer-reviewer CR-03とME-05のルート順序を修正する`
- `/writer-reviewer HI-07の.single()→.maybe_single()を全repositoryで置換する`

---

## ARGUMENTS

このスキルはタスク説明を引数として受け取る。

---

## ワークフロー手順

### Phase 0: 並列探索（Explorer agents）

以下の **2つの Explore エージェントを同時に** 起動する（並列実行）：

**Explorer A（仕様読み込み）** — subagent_type: Explore, run_in_background: false
```
以下の仕様ドキュメントを読み、タスク「<ARGUMENTS>」に直接関係するルール・パターンのみを 500字以内で要約せよ。
無関係な項目は省略すること。

読むべきドキュメント:
- aidlc-docs/construction/backend/functional-design/business-rules.md
- aidlc-docs/construction/backend/functional-design/business-logic-model.md
- aidlc-docs/construction/backend/nfr-design/nfr-design-patterns.md

出力形式: 箇条書き、500字以内、日本語
```

**Explorer B（対象コード読み込み）** — subagent_type: Explore, run_in_background: false
```
タスク「<ARGUMENTS>」で変更対象となるファイルを読み、現在の実装を 300字以内で要約せよ。
変更に関係しない部分は省略すること。

出力形式: ファイル名と問題箇所を箇条書き、300字以内、日本語
```

両エージェントの完了を待ち、要約を受け取る。

---

### Phase 1: Writer（コード生成）

code-writer エージェントを `isolation: worktree` で起動する。
Explorer の要約を渡し、生ファイルは渡さない。

```
タスク: <ARGUMENTS>

## 仕様要約（Explorer A）
<Explorer A の出力をそのまま貼る>

## 現状コード要約（Explorer B）
<Explorer B の出力をそのまま貼る>

## 対象ファイル
<変更するファイルのパス一覧>

## 参照ドキュメント
必要に応じて直接読むこと: aidlc-docs/construction/backend/

## 完了後の必須作業
backend/handoff.md を生成すること（フォーマットは writer.md 参照）。
handoff.md の内容のみを返却すること。実装の詳細説明は不要。
```

Writer の完了を待ち、**handoff.md の内容のみ**を受け取る。

---

### Phase 2: Reviewer（コードレビュー）

code-reviewer エージェントを起動する。
**Writer の実装意図・判断は一切渡さない。**

```
以下の情報のみを使ってコードレビューを実施せよ:

## handoff.md の場所
backend/handoff.md を読むこと

## 仕様ドキュメント
aidlc-docs/construction/backend/

## レビュー対象
handoff.md の「変更ファイル」セクションに記載されたファイルのみ

## 返却フォーマット
- CRITICAL / HIGH: 各項目の詳細（ファイル・行番号・問題・修正方針）
- MEDIUM / LOW: 件数と1行サマリーのみ（詳細不要）
- 正常確認済み項目: 箇条書き

注意: Writer がなぜそう実装したかは考慮しない。仕様とコードだけで判断すること。
```

---

### Phase 3: 結果提示

レビュー完了後、以下をユーザーに提示する：

1. **変更サマリー**（handoff.md の「変更内容」セクションから）
2. **Reviewer レポート**
   - CRITICAL/HIGH: 詳細
   - MEDIUM/LOW: 件数のみ（「詳細を見ますか？」と確認する）
3. **次のアクション提案**:
   - CRITICAL/HIGH あり → 「再度 Writer で修正しますか？」
   - LOW のみ / 問題なし → 「worktree をマージしますか？」

---

## 注意事項

- Writer は `isolation: worktree` で動作するため、変更は隔離されたブランチに存在する
- handoff.md は **事実のみ**（実装意図・設計判断は書かない）
- CRITICAL が残った状態でマージしない
- マージはユーザー確認・承認後のみ実施する
