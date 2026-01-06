# Pages Router Support

このディレクトリは、Next.js Pages Routerとの互換性を保つために存在します。

現在のプロジェクトではApp Routerを使用していますが、Pages Routerも併用可能な構造を維持しています。

## ディレクトリ構造

- `/app` - Next.js App Router のルーティング
- `/pages` - Next.js Pages Router のルーティング（互換性のため空）
- `/src/pages` - FSD Pages レイヤー（ページコンポーネント）

## FSDとの関係

FSD（Feature-Sliced Design）のページレイヤーは `/src/pages` に配置されており、
Next.js のルーティングディレクトリとは明確に分離されています。
