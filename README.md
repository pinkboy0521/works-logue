# Works Logue

これは[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)でブートストラップされた[Next.js](https://nextjs.org)プロジェクトです。

## はじめに

### 前提条件

1. 依存関係をインストール:

```bash
npm install
```

### データベースセットアップ

1. Cloud SQL Proxy を起動:

```bash
cloud-sql-proxy works-logue:asia-northeast1:workslogue-postgres --port 5432
```

2. 環境変数を設定:
   `.env`ファイルを作成し、データベース接続文字列を追加してください。

3. データベースマイグレーションを実行:

```bash
npx prisma migrate dev
npx prisma migrate dev reset
```

4. データベースにシードデータを投入:

```bash
npx prisma db seed
```

### 開発

開発サーバーを起動:

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで[http://localhost:3000](http://localhost:3000)を開いて結果を確認してください。

`app/page.tsx`を編集することでページの編集を開始できます。ファイルを編集すると、ページが自動的に更新されます。

このプロジェクトは[`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)を使用して、Vercel の新しいフォントファミリーである[Geist](https://vercel.com/font)を自動的に最適化し、読み込みます。

## データベース管理

### Prisma コマンド

- **ブラウザでデータベースを表示**:

```bash
npx prisma studio
```

- **データベースをリセット** (全データを削除):

```bash
npx prisma migrate reset
```

- **Prisma クライアントを生成**:

```bash
npx prisma generate
```

- **本番環境にマイグレーションをデプロイ**:

```bash
npx prisma migrate deploy
```

## さらに学ぶ

Next.js についてさらに学ぶには、以下のリソースをご覧ください:

- [Next.js ドキュメント](https://nextjs.org/docs) - Next.js の機能と API について学習
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブな Next.js チュートリアル

[Next.js GitHub リポジトリ](https://github.com/vercel/next.js)もチェックしてください。フィードバックやコントリビューションを歓迎します！

## Vercel でデプロイ

Next.js アプリをデプロイする最も簡単な方法は、Next.js の作成者による[Vercel プラットフォーム](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)を使用することです。

詳細については、[Next.js デプロイメントドキュメント](https://nextjs.org/docs/app/building-your-application/deploying)をご覧ください。
