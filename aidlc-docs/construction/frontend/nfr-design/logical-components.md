# Logical Components — Unit 2: frontend

## コンポーネント一覧

| ID | コンポーネント | 種別 | 場所 |
|---|---|---|---|
| LC-FE-01 | Supabase クライアントファクトリー | ライブラリ | `lib/supabase/` |
| LC-FE-02 | API クライアント（Server / Client） | ライブラリ | `lib/api/` |
| LC-FE-03 | QueryClient プロバイダー | インフラ | `lib/query-client.ts` |
| LC-FE-04 | Jotai Store（atoms） | 状態管理 | `store/atoms.ts` |
| LC-FE-05 | AuthProvider | Client Component | `features/auth/components/AuthProvider.tsx` |
| LC-FE-06 | Middleware（認証ガード） | インフラ | `middleware.ts` |
| LC-FE-07 | useSeedRealtime フック | フック | `features/seed/hooks/useSeedRealtime.ts` |
| LC-FE-08 | useReactionMutation フック | フック | `features/log/hooks/useReactionMutation.ts` |
| LC-FE-09 | Skeleton コンポーネント群 | UI | `components/ui/skeletons/` |
| LC-FE-10 | error.tsx ファイル群 | インフラ | `app/**/error.tsx` |
| LC-FE-11 | loading.tsx ファイル群 | インフラ | `app/**/loading.tsx` |

---

## LC-FE-01: Supabase クライアントファクトリー

**場所**: `lib/supabase/`

**目的**: Server Component / Client Component / Middleware それぞれに適切な Supabase クライアントを提供する。

```
lib/supabase/
  browser-client.ts   ← createBrowserClient()（Client Components 用）
  server-client.ts    ← createServerClient()（Server Components / Server Actions 用）
```

**browser-client.ts**:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// シングルトンインスタンス（Client Component 内で使用）
export const supabase = createSupabaseBrowserClient()
```

**server-client.ts**:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
}
```

---

## LC-FE-02: API クライアント（Server / Client）

**場所**: `lib/api/`

**目的**: バックエンド API へのリクエストに認証ヘッダーを自動付与し、エラーハンドリングを統一する。

```
lib/api/
  server.ts   ← Server Components / Server Actions からの fetch
  client.ts   ← Client Components / React Query からの fetch
  types.ts    ← API レスポンス型・エラー型
```

**server.ts（概略）**:
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!

export const apiServer = {
  async get<T>(path: string, session: Session | null): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      next: { revalidate: 0 },  // SSR: キャッシュなし
    })
    if (!res.ok) throw new ApiError(res.status, await res.json())
    return res.json()
  },
}
```

**client.ts（概略）**:
```typescript
export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
    })
    if (!res.ok) throw new ApiError(res.status, await res.json())
    return res.json()
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new ApiError(res.status, await res.json())
    return res.json()
  },

  put: /* ... PUT メソッド */ null,
  delete: /* ... DELETE メソッド */ null,
}
```

---

## LC-FE-03: QueryClient プロバイダー

**場所**: `lib/query-client.ts`, `app/layout.tsx`

**目的**: TanStack Query のグローバル設定を提供する。

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,      // NFR-FE-11: デフォルト維持
        gcTime: 5 * 60 * 1000,  // 5分
        retry: 3,
      },
    },
  })
}
```

**Providers コンポーネント**（`app/providers.tsx`）:
```typescript
'use client'
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={jotaiStore}>  {/* Jotai */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </Provider>
    </QueryClientProvider>
  )
}
```

---

## LC-FE-04: Jotai Store（atoms）

**場所**: `store/atoms.ts`

**目的**: グローバルかつ軽量な UI 状態を管理する。

```typescript
import { atom } from 'jotai'

// ─── 認証 ───────────────────────────────────────────
export const userAtom = atom<User | null>(null)
export const sessionAtom = atom<Session | null>(null)

// ─── 通知 ───────────────────────────────────────────
export const notificationUnreadCountAtom = atom<number>(0)

// ─── Seed フォーム ────────────────────────────────────
interface SeedFormState {
  step: 1 | 2 | 3 | 4
  type: SeedType | null
  title: string
  content: string
  tag_ids: string[]
  cleanse_suggestions: CleanseSuggestion[]
  cleanse_loading: boolean
}

export const seedFormAtom = atom<SeedFormState>({
  step: 1,
  type: null,
  title: '',
  content: '',
  tag_ids: [],
  cleanse_suggestions: [],
  cleanse_loading: false,
})
```

---

## LC-FE-05: AuthProvider

**場所**: `features/auth/components/AuthProvider.tsx`

**目的**:
1. Supabase Auth セッションを初期化し `userAtom` / `sessionAtom` を設定する
2. 認証状態の変化を購読し atoms を更新する
3. グローバル通知 Realtime チャネルを管理する（LC-FE-07 の通知版）
4. サインアウト時に React Query キャッシュをクリアする

**責務**:

```
AuthProvider
  ├── supabase.auth.getSession() → sessionAtom 初期化
  ├── supabase.auth.onAuthStateChange() → atoms 更新
  │     └── SIGNED_OUT → queryClient.clear()
  └── [ログイン中のみ] notifications テーブル Realtime 購読
        └── INSERT → notificationUnreadCountAtom + 1
```

---

## LC-FE-06: Middleware（認証ガード）

**場所**: `middleware.ts`（プロジェクトルート）

**目的**: 保護ルートへの未認証アクセスをサーバーサイドで遮断する。

**処理フロー**:
```
リクエスト
  └── createServerClient（cookie から session 取得）
        ├── session あり → NextResponse.next()（通過）
        └── session なし + 保護ルート
              └── redirect('/login?redirect={pathname}')
                    ※ redirect パラメータは同一オリジンのみ許可
```

**設定**:
```typescript
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## LC-FE-07: useSeedRealtime フック

**場所**: `features/seed/hooks/useSeedRealtime.ts`

**目的**: SeedDetailPage がマウントされている間、Seed と Louge の変化をリアルタイムで受信する。

**チャネル**:

| チャネル名 | テーブル | イベント | 処理 |
|---|---|---|---|
| `seed-detail-{seedId}` | seeds | UPDATE | React Query キャッシュを直接更新（stage / status / structural_completeness） |
| `louges-for-seed-{seedId}` | louges | UPDATE | status = published → React Query invalidate |

**生存期間**: SeedDetailPage マウント中（useEffect cleanup で removeChannel）

---

## LC-FE-08: useReactionMutation / useReplyMutation フック

**場所**: `features/log/hooks/`

**目的**: LogThread のリアクション・返信に楽観的更新を提供する。

| フック | API | 楽観的更新ターゲット |
|---|---|---|
| `useReactionMutation(logId)` | POST /logs/{id}/reactions | `['logs', seedId]` キャッシュ内の reactions 配列 |
| `useReplyMutation(logId)` | POST /logs/{id}/replies | `['logs', seedId]` キャッシュ内の replies 配列 |

**エラー時**: `onMutate` で保存したスナップショットにロールバック

---

## LC-FE-09: Skeleton コンポーネント群

**場所**: `components/ui/skeletons/`

| ファイル | 対象 | 使用箇所 |
|---|---|---|
| `SeedCardSkeleton.tsx` | SeedCard | seeds/loading.tsx |
| `SeedDetailSkeleton.tsx` | SeedDetailPage 全体 | seeds/[id]/loading.tsx |
| `LogItemSkeleton.tsx` | LogItem | SeedDetailPage 内 Suspense |
| `LougeCardSkeleton.tsx` | LougeCard | louges/loading.tsx |
| `LougeDetailSkeleton.tsx` | LougeDetailPage 全体 | louges/[id]/loading.tsx |
| `ProfileHeaderSkeleton.tsx` | ProfileHeader | profile/[userId]/loading.tsx |
| `ScoreBreakdownSkeleton.tsx` | ScoreBreakdownAccordion | ProfilePage 内 Suspense |

**実装パターン**:
```tsx
// shadcn/ui Skeleton を使用
import { Skeleton } from '@/components/ui/skeleton'

export function SeedCardSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-12 w-12 rounded-full" />  {/* GrowthIndicator */}
    </div>
  )
}
```

---

## LC-FE-10: error.tsx ファイル群

**場所**: `app/**/error.tsx`

| ファイル | スコープ |
|---|---|
| `app/error.tsx` | グローバルフォールバック |
| `app/seeds/[id]/error.tsx` | SeedDetail エラー |
| `app/louges/[id]/error.tsx` | LougeDetail エラー |
| `app/profile/[userId]/error.tsx` | Profile エラー |

**共通実装パターン**:
```tsx
'use client'
export default function ErrorBoundary({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <p className="text-muted-foreground">データの読み込みに失敗しました</p>
      <Button onClick={reset} variant="outline">再試行</Button>
    </div>
  )
}
```

---

## LC-FE-11: loading.tsx ファイル群

**場所**: `app/**/loading.tsx`

| ファイル | 表示コンテンツ |
|---|---|
| `app/seeds/loading.tsx` | SeedCardSkeleton × 5 |
| `app/seeds/[id]/loading.tsx` | SeedDetailSkeleton |
| `app/louges/loading.tsx` | LougeCardSkeleton × 5 |
| `app/louges/[id]/loading.tsx` | LougeDetailSkeleton |
| `app/profile/[userId]/loading.tsx` | ProfileHeaderSkeleton |

---

## コンポーネント依存関係

```
app/layout.tsx
  └── Providers（LC-FE-03 QueryClient + Jotai）
        └── AuthProvider（LC-FE-05）
              ├── supabase browser client（LC-FE-01）
              ├── userAtom / sessionAtom（LC-FE-04）
              └── notifications Realtime → notificationUnreadCountAtom（LC-FE-04）

middleware.ts（LC-FE-06）
  └── supabase server client（LC-FE-01）

Server Components（各ページ）
  └── apiServer（LC-FE-02）
        └── supabase server client（LC-FE-01）

Client Components（React Query）
  └── apiClient（LC-FE-02）
        └── supabase browser client（LC-FE-01）

SeedDetailPage
  └── useSeedRealtime（LC-FE-07）

LogThread
  ├── useReactionMutation（LC-FE-08）
  └── useReplyMutation（LC-FE-08）
```
