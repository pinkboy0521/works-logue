# Infrastructure Design — Unit 2: frontend

## インフラ全体構成

### Vercel プロジェクト構成

```
Vercel Project: works-logue
├── Production Environment
│   ├── ブランチ: main
│   ├── URL: https://workslogue.com（カスタムドメイン）
│   └── URL: https://works-logue.vercel.app（Vercel デフォルト）
├── Preview Environment
│   ├── トリガー: PR 作成 / push
│   └── URL: https://works-logue-[hash]-[team].vercel.app（自動生成）
└── Development Environment
    └── ローカル: http://localhost:3000
```

---

## サービスマッピング

### 論理コンポーネント → インフラサービス

| 論理コンポーネント | インフラサービス | 備考 |
|---|---|---|
| Next.js App（SSR / SSG） | Vercel Serverless Functions | App Router Server Components |
| 静的アセット（JS / CSS / 画像） | Vercel Edge Network（CDN） | 自動配信・WebP 変換 |
| LC-FE-01 Supabase クライアント | Supabase（外部） | NEXT_PUBLIC_SUPABASE_URL / ANON_KEY |
| LC-FE-02 API クライアント | Cloud Run（外部） | NEXT_PUBLIC_API_BASE_URL |
| LC-FE-06 Middleware（認証ガード） | Vercel Edge Middleware | `middleware.ts`（CDN エッジで実行） |
| モニタリング | Vercel Analytics + SpeedInsights | 自動インジェクション |
| CI/CD | Vercel GitHub Integration | main push → 本番デプロイ |

---

## Vercel 詳細設定

### プロジェクト設定

```yaml
project-name: works-logue
framework: nextjs
root-directory: /           # モノレポの場合は frontend/ に変更
build-command: next build   # Vercel デフォルト
output-directory: .next     # Vercel デフォルト
node-version: 20.x
```

### ブランチ設定

| ブランチ | 環境 | デプロイ | URL |
|---|---|---|---|
| `main` | Production | 自動（push 時） | https://workslogue.com |
| PR / その他 | Preview | 自動（PR 作成 / push 時） | https://works-logue-[hash].vercel.app |

---

## 環境変数（Vercel Environment Variables）

### Production / Preview 共通

| 変数名 | 値 | スコープ |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL | Public（ブラウザ公開） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon キー | Public（ブラウザ公開） |
| `NEXT_PUBLIC_API_BASE_URL` | Cloud Run URL | Public（ブラウザ公開） |

### Production のみ

| 変数名 | 値 | スコープ |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://works-logue-api-[HASH]-an.a.run.app` | Production |

### Preview のみ

| 変数名 | 値 | スコープ |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://works-logue-api-[HASH]-an.a.run.app`（本番と同じ API を参照） | Preview |

> **注意**: `NEXT_PUBLIC_` プレフィックスの変数はクライアントバンドルに含まれる。Supabase anon キーは公開設計のため問題なし。

---

## カスタムドメイン設定（workslogue.com）

### Vercel Domain 設定

```
ドメイン: workslogue.com
プロジェクト: works-logue
環境: Production

DNS 設定（ドメインレジストラ側）:
  workslogue.com    → A    76.76.19.61（Vercel IP）
  www.workslogue.com → CNAME cname.vercel-dns.com
```

### www リダイレクト

```
workslogue.com → メインドメイン（Vercel 管理画面で設定）
www.workslogue.com → workslogue.com へ 308 リダイレクト（推奨）
```

---

## バックエンド CORS 更新（必須）

カスタムドメイン追加により、バックエンドの CORS 設定を更新する必要があります。

```python
# main.py — CORS 設定更新後
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://workslogue.com",            # 本番カスタムドメイン（追加）
        "https://www.workslogue.com",         # www サブドメイン（追加）
        "https://works-logue.vercel.app",    # Vercel デフォルト URL（既存）
        "http://localhost:3000",              # ローカル開発（既存）
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

> **注意**: Preview デプロイの URL（`*.vercel.app`）はワイルドカード指定不可。Preview 環境からバックエンドを呼ぶ場合、`works-logue.vercel.app` の許可で代替可能。

---

## Supabase Auth 設定更新（必須）

カスタムドメイン追加により、Supabase の認証設定を更新する必要があります。

```
Supabase Dashboard → Authentication → URL Configuration

Site URL:
  https://workslogue.com

Redirect URLs（追加）:
  https://workslogue.com/**
  https://www.workslogue.com/**
  https://works-logue.vercel.app/**
  http://localhost:3000/**
```

---

## CI/CD フロー

```
開発者
  └── git push origin main
        └── GitHub
              └── Vercel GitHub Integration（Webhook）
                    ├── next build（ビルド）
                    │     └── ESLint チェック（自動）
                    ├── Vercel Edge Network にデプロイ
                    └── https://workslogue.com で公開
```

### ビルド失敗時

- Vercel ダッシュボード / GitHub Checks でエラー確認
- 前回デプロイは自動的に維持（ロールバック不要）

---

## モニタリング

| サービス | 用途 | 設定 |
|---|---|---|
| Vercel Analytics | ページビュー・ユニークユーザー | `layout.tsx` に `<Analytics />` 追加 |
| Vercel SpeedInsights | Core Web Vitals（LCP / CLS / FID） | `layout.tsx` に `<SpeedInsights />` 追加 |
| Vercel Logs | リアルタイムログ（Server Components / Middleware） | ダッシュボードで確認 |

---

## ネットワーク・セキュリティ

| 項目 | 設定 |
|---|---|
| HTTPS | Vercel が自動で TLS 証明書を発行・更新（Let's Encrypt） |
| HTTP → HTTPS | Vercel が自動リダイレクト |
| セキュリティヘッダー | `next.config.js` で `X-Frame-Options`, `X-Content-Type-Options` 等を設定 |
| Middleware 認証ガード | Vercel Edge で実行（LC-FE-06） |

### next.config.js セキュリティヘッダー

```javascript
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}
```
