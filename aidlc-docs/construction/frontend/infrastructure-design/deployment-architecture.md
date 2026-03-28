# Deployment Architecture — Unit 2: frontend

## 全体デプロイアーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                         インターネット                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network (CDN)                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  workslogue.com / works-logue.vercel.app                │   │
│  │                                                          │   │
│  │  ┌───────────────┐    ┌─────────────────────────────┐  │   │
│  │  │ Edge Middleware│    │   Static Assets (CDN Cache) │  │   │
│  │  │ (middleware.ts)│    │   JS / CSS / Images         │  │   │
│  │  │ 認証ガード     │    │   Next.js Image (WebP)      │  │   │
│  │  └───────┬───────┘    └─────────────────────────────┘  │   │
│  │          │                                               │   │
│  │          ▼                                               │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │        Vercel Serverless Functions (Next.js)       │  │   │
│  │  │                                                   │  │   │
│  │  │  Server Components (SSR)                         │  │   │
│  │  │    SeedFeedPage / SeedDetailPage                 │  │   │
│  │  │    LougeDetailPage / ProfilePage                 │  │   │
│  │  │                                                   │  │   │
│  │  │  Client Components (Hydration)                   │  │   │
│  │  │    SeedFormPage / LougeListPage                  │  │   │
│  │  │    AuthProvider / Jotai / TanStack Query         │  │   │
│  │  └───────────────────┬───────────────────────────────┘  │   │
│  └──────────────────────┼──────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTPS API Calls
          ┌───────────────┼───────────────────┐
          ▼               ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  GCP Cloud   │  │   Supabase   │  │  Supabase        │
│  Run API     │  │   Auth       │  │  Realtime        │
│  (Backend)   │  │   (JWT)      │  │  (WebSocket)     │
│              │  │              │  │                  │
│ /seeds       │  │ Magic Link   │  │ notifications    │
│ /logs        │  │ Email/PW     │  │ テーブル変更     │
│ /louges      │  │              │  │                  │
│ /profiles    │  │              │  │                  │
└──────────────┘  └──────────────┘  └──────────────────┘
```

---

## CI/CD パイプライン

```
┌─────────────────────────────────────────────────────────────────┐
│                      開発フロー                                  │
│                                                                  │
│  1. 開発者が feature/* ブランチで開発                           │
│       └── git push origin feature/xxx                           │
│             └── Vercel: Preview Deploy（自動）                  │
│                   URL: https://works-logue-[hash].vercel.app    │
│                                                                  │
│  2. PR 作成                                                      │
│       └── GitHub PR                                             │
│             └── Vercel: Preview Deploy（更新）                  │
│                   GitHub Checks: ✅ Vercel Build Passed         │
│                                                                  │
│  3. main ブランチへマージ                                        │
│       └── git merge main                                        │
│             └── Vercel: Production Deploy（自動）               │
│                   URL: https://workslogue.com                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 環境別設定

| 項目 | Production | Preview |
|---|---|---|
| URL | https://workslogue.com | https://works-logue-[hash].vercel.app |
| NEXT_PUBLIC_API_BASE_URL | Cloud Run 本番 URL | Cloud Run 本番 URL（同じ） |
| NEXT_PUBLIC_SUPABASE_URL | 本番 Supabase | 本番 Supabase（同じ） |
| Vercel Analytics | 有効 | 有効 |
| ブランチ | main | feature/* / PR |

---

## デプロイチェックリスト

### 初回デプロイ時

```
[ ] Vercel プロジェクト作成（works-logue）
[ ] GitHub リポジトリと連携
[ ] 環境変数設定（Production）
    [ ] NEXT_PUBLIC_SUPABASE_URL
    [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
    [ ] NEXT_PUBLIC_API_BASE_URL（Cloud Run デプロイ後に設定）
[ ] 環境変数設定（Preview）
    [ ] 上記と同じ値
[ ] カスタムドメイン設定
    [ ] workslogue.com → Vercel に追加
    [ ] DNS 設定（ドメインレジストラ側）
    [ ] www.workslogue.com → workslogue.com リダイレクト設定
[ ] Supabase Auth URL Configuration 更新
    [ ] Site URL: https://workslogue.com
    [ ] Redirect URLs に https://workslogue.com/** 追加
[ ] バックエンド CORS 設定更新（main.py）
    [ ] https://workslogue.com 追加
    [ ] https://www.workslogue.com 追加
[ ] Vercel Analytics / SpeedInsights 有効化確認
```

---

## ロールバック手順

Vercel は全デプロイメントの履歴を保持します。

```
Vercel ダッシュボード
  → works-logue プロジェクト
  → Deployments タブ
  → 対象デプロイの "..." メニュー
  → "Promote to Production"
```

> 前のデプロイを Production に昇格させるだけでロールバック完了（数秒）。

---

## リージョン・レイテンシ考慮

| サービス | リージョン | 備考 |
|---|---|---|
| Vercel Edge Network | グローバル CDN | 静的アセットはエッジキャッシュ |
| Vercel Serverless Functions | `iad1`（デフォルト US East） | 設定で `hnd1`（東京）に変更推奨 |
| Cloud Run | `asia-northeast1`（東京） | — |
| Supabase | `ap-northeast-1`（東京） | — |

### Vercel Function Region 設定（推奨）

```javascript
// next.config.js
module.exports = {
  // Server Components / Route Handlers のリージョン指定
  // 各 page.tsx や route.ts に以下を追加:
  // export const runtime = 'edge'  // Edge Runtime（軽量）
  // または vercel.json で設定:
}
```

```json
// vercel.json（プロジェクトルート）
{
  "regions": ["hnd1"]
}
```
