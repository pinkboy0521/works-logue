# 開発環境構築仕様書

**文書番号**: DEV-001  
**バージョン**: 1.0.0  
**最終更新**: 2026-01-24

## 概要

Works Logue プロジェクトのローカル開発環境セットアップ手順と開発フローを定義します。

## 前提条件

### 必要なソフトウェア

| ソフトウェア | バージョン | 必須 | 備考 |
|-------------|------------|------|------|
| Node.js | 18.17.0以上 | ✅ | LTS推奨 |
| npm | 9.6.7以上 | ✅ | Node.jsに含まれる |
| Git | 2.40以上 | ✅ | バージョン管理 |
| PostgreSQL | 14.0以上 | ✅ | データベース |
| VS Code | 最新版 | 推奨 | 推奨エディタ |

### 推奨システム要件

| 項目 | 最小要件 | 推奨要件 |
|------|---------|---------|
| OS | Windows 10/macOS 12/Ubuntu 20.04 | Windows 11/macOS 13/Ubuntu 22.04 |
| CPU | 2コア以上 | 4コア以上 |
| メモリ | 8GB以上 | 16GB以上 |
| ディスク容量 | 10GB以上 | 20GB以上 |

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/pinkboy0521/works-logue.git
cd works-logue
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

#### 3.1 環境変数ファイルの作成

```bash
cp .env.example .env
```

#### 3.2 必要な環境変数

```env
# データベース接続
DATABASE_URL="postgresql://username:password@localhost:5432/works_logue_dev"

# NextAuth.js設定
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth設定（必要に応じて）
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. データベース設定

#### 4.1 PostgreSQL データベース作成

```sql
CREATE DATABASE works_logue_dev;
CREATE USER works_logue_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE works_logue_dev TO works_logue_user;
```

#### 4.2 Prisma マイグレーション実行

```bash
# データベーススキーマの適用
npx prisma migrate deploy

# 開発用データの投入
npx prisma db seed
```

### 5. 開発サーバー起動

```bash
npm run dev
```

開発サーバーが `http://localhost:3000` で起動します。

## 開発フロー

### ブランチ戦略

| ブランチタイプ | 命名規則 | 説明 |
|--------------|----------|------|
| feature | `feature/機能名` | 新機能開発 |
| bugfix | `bugfix/バグ名` | バグ修正 |
| hotfix | `hotfix/緊急修正名` | 緊急修正 |
| docs | `docs/ドキュメント名` | ドキュメント更新 |

### コミットメッセージ規約

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### コミットタイプ

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: スタイル変更
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: その他のタスク

### 開発コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクションサーバー起動 |
| `npm run lint` | ESLint実行 |
| `npm run lint:fix` | ESLint自動修正 |
| `npm run type-check` | TypeScript型チェック |
| `npm run db:migrate` | データベースマイグレーション |
| `npm run db:seed` | シードデータ投入 |
| `npm run db:studio` | Prisma Studio起動 |

## 開発ツール設定

### VS Code 拡張機能

必須拡張機能：
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- TypeScript Importer
- Prisma
- Tailwind CSS IntelliSense

推奨拡張機能：
- GitLens
- Auto Rename Tag
- Bracket Pair Colorizer
- Material Icon Theme

### ESLint設定

```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      "no-console": "warn",
      "prefer-const": "error",
      "@typescript-eslint/no-unused-vars": "error"
    }
  }
];
```

### Prettier設定

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## トラブルシューティング

### 一般的な問題と解決法

#### Node.js バージョン問題

```bash
# nodeのバージョン確認
node --version

# nvmを使用したバージョン管理
nvm install 18.17.0
nvm use 18.17.0
```

#### データベース接続エラー

```bash
# PostgreSQLサービス確認
sudo systemctl status postgresql  # Linux
brew services list postgresql     # macOS

# 接続テスト
psql -h localhost -U works_logue_user -d works_logue_dev
```

#### ポート競合エラー

```bash
# ポート使用状況確認
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# プロセス終了
kill -9 <PID>
```

#### Prisma関連エラー

```bash
# Prismaクライアント再生成
npx prisma generate

# データベースリセット
npx prisma migrate reset
```

### ログ確認方法

#### アプリケーションログ

```bash
# 開発サーバーログ
tail -f .next/trace

# データベースログ
tail -f /var/log/postgresql/postgresql-14-main.log
```

## パフォーマンス最適化

### 開発環境での最適化

#### Hot Module Replacement (HMR)

```javascript
// next.config.ts
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.svg": ["@svgr/webpack"]
      }
    }
  }
};
```

#### TypeScript 設定

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".next/cache/tsconfig.tsbuildinfo"
  }
}
```

## セキュリティ設定

### 開発環境のセキュリティ

#### 環境変数管理

```bash
# .envファイルのパーミッション設定
chmod 600 .env
```

#### 依存関係の脆弱性チェック

```bash
# npm audit実行
npm audit

# 自動修正
npm audit fix
```

## 品質保証

### コード品質チェック

```bash
# リント + 型チェック + フォーマット
npm run quality-check
```

### プリコミットフック

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

## 関連ドキュメント

- [本番環境構築](production.md) - 本番環境のデプロイ手順
- [CI/CD パイプライン](ci-cd.md) - 自動化設定
- [監視・運用](monitoring.md) - ログ・メトリクス監視
- [内部設計書 - アーキテクチャ](../internal-design/architecture.md) - システム構成
- [内部設計書 - データベース](../internal-design/database.md) - DB設計