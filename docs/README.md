# Works Logue ドキュメント

Works Logue プロジェクトの技術仕様とガイドラインをまとめたドキュメントです。

## 📚 ドキュメント一覧

- [ブックマーク・いいね機能](./features/bookmark-like-system.md) - ユーザーリアクション機能の完全ガイド
- [アーキテクチャ](./architecture/overview.md) - プロジェクトの全体的な設計方針
- [FSD設計方針](./architecture/fsd-architecture.md) - Feature-Sliced Design の実装ガイド
- [UI/UX ガイドライン](./ui-ux/design-system.md) - shadcn/ui を中心とした UI 設計

## 🚀 最近の更新

- **2026-01-24**: ブックマーク・いいね機能の実装完了
- **2026-01-24**: 記事カードの横長レイアウト化
- **2026-01-24**: 閲覧数重複カウント問題の修正

## 🛠️ 開発環境

- Next.js 15.5.9 (App Router)
- React 19
- TypeScript
- Prisma (PostgreSQL)
- NextAuth.js v5
- shadcn/ui + Tailwind CSS
- Feature-Sliced Design (FSD)

## 📋 プロジェクト規約

本プロジェクトは以下の設計原則に従って開発されています：

1. **FSD アーキテクチャ**: 保守性とスケーラビリティを重視
2. **型安全性**: TypeScript による厳密な型チェック
3. **UI統一**: shadcn/ui による一貫したデザインシステム
4. **Server/Client 分離**: Next.js App Router のベストプラクティス

詳細は各ドキュメントを参照してください。
