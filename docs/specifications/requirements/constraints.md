# Works Logue - 制約事項

**バージョン**: 1.0  
**最終更新**: 2026年1月24日  
**ステータス**: 実装済み

## 1. 技術制約

### 1.1 技術スタック

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Backend**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL + Prisma ORM
- **UI**: shadcn/ui + Tailwind CSS + Radix UI
- **Authentication**: NextAuth.js v5
- **Deployment**: Vercel（推奨）

### 1.2 開発制約

- TypeScript 必須（any型禁止）
- Feature-Sliced Design（FSD）アーキテクチャ準拠
- 公開API経由のインポート（@/shared等）
- テスト駆動開発（TDD）推奨

## 2. 外部依存制約

### 2.1 外部サービス

- **メール送信**: SendGrid API
- **画像ストレージ**: Cloudinary
- **ホスティング**: Vercel
- **データベース**: PostgreSQL（Neon等のDBaaS）

### 2.2 外部API制限

- SendGrid: 月間100通（Free tier）
- Cloudinary: 月間25GB転送量
- API Rate Limiting実装必須

## 3. 運用制約

### 3.1 リソース制約

- 開発チーム: 1-2名体制
- 運用予算: 月額$50以下（初期フェーズ）
- サポート体制: 平日日中対応

### 3.2 コンプライアンス

- 個人情報保護法準拠
- 利用規約・プライバシーポリシー策定必須
- ログ保管期間: 90日間

---

## 変更履歴

| 日付       | バージョン | 変更者   | 変更内容                             |
| ---------- | ---------- | -------- | ------------------------------------ |
| 2026-01-24 | 1.0        | システム | 要件定義書から制約事項を分離・独立化 |
