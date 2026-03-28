# NFR Design Patterns — Unit 2: frontend

## 設計根拠

| 質問 | 回答 | 採用パターン |
|---|---|---|
| Q1: ローディング状態 | C — loading.tsx + 手動 Suspense 併用 | P-FE-02 |
| Q2: Realtime チャネル管理 | C — FC-03 はローカル、FC-10 はグローバル Jotai | P-FE-03 |

---

## P-FE-01: Server / Client Component 分界パターン

**目的**: 不要な JavaScript をクライアントに送らず、初期表示を高速化する。

### 分類ルール

| コンポーネント種別 | レンダリング | 判断基準 |
|---|---|---|
| SeedFeedPage（初期表示） | Server Component | 初期データを fetch して HTML に含める |
| SeedDetailPage（初期表示） | Server Component | SEO + 初期表示速度 |
| LougeDetailPage（初期表示） | Server Component | SEO + 初期表示速度 |
| ProfilePage（初期表示） | Server Component | 静的プロフィール表示 |
| SeedCard リスト（無限スクロール部分） | Client Component | Intersection Observer が必要 |
| GrowthIndicator（Realtime 受信側） | Client Component | Supabase Realtime 購読が必要 |
| LougeListPage（検索） | Client Component | デバウンス + useState が必要 |
| SeedFormPage | Client Component | マルチステップ + Jotai が必要 |
| AuthProvider | Client Component | Supabase Auth SDK が必要 |
| NotificationDropdown | Client Component | Realtime + useState が必要 |

### 実装ガイドライン

```
原則: 'use client' は末端コンポーネントに限定する

[Server Component]
  └── [Server Component] ← データフェッチ
        └── [Client Component boundary]  ← 'use client' はここから
              └── [Client Component]
```

- Server Component は `async function` で直接 `fetch()` を呼び出す
- Server Component から Client Component へはシリアライズ可能な props のみ渡す
- イベントハンドラ・フック・ブラウザ API を使う場合のみ `'use client'` を付与

---

## P-FE-02: ローディング状態パターン（Q1: C）

**目的**: ページ遷移・データフェッチ中のユーザー体験を統一する。

### 2層構造

#### 層1 — ページレベル: `loading.tsx`（App Router 規約）

```
app/
  seeds/
    loading.tsx          ← SeedFeedPage 全体のスケルトン
    [id]/
      loading.tsx        ← SeedDetailPage 全体のスケルトン
  louges/
    loading.tsx          ← LougeListPage 全体のスケルトン
    [id]/
      loading.tsx        ← LougeDetailPage 全体のスケルトン
  profile/
    [userId]/
      loading.tsx        ← ProfilePage 全体のスケルトン
```

- Next.js が自動的に `<Suspense>` 境界を設定
- ページナビゲーション時に即座にローディング UI を表示

#### 層2 — サブコンポーネントレベル: 手動 `<Suspense>` + `<Skeleton>`

```tsx
// SeedDetailPage 内の遅延ロード部分
<Suspense fallback={<ScoreBreakdownSkeleton />}>
  <ScoreBreakdownSection userId={userId} />
</Suspense>

// ProfilePage 内の ScoreHistory（クリック後に遅延ロード）
<Suspense fallback={<Skeleton className="h-24 w-full" />}>
  <ScoreHistorySection userId={userId} />
</Suspense>
```

### Skeleton コンポーネント設計

| Skeleton | 対象コンポーネント | 構成要素 |
|---|---|---|
| `SeedCardSkeleton` | SeedCard | Avatar + 2行テキスト + GrowthIndicator placeholder |
| `LogItemSkeleton` | LogItem | Avatar + 3行テキスト |
| `LougeCardSkeleton` | LougeCard | タイトル + 2行テキスト + アバター列 |
| `ProfileHeaderSkeleton` | ProfileHeader | Avatar（大） + 2行テキスト + タグ列 |
| `ScoreBreakdownSkeleton` | ScoreBreakdownAccordion | 3行の数値プレースホルダー |

---

## P-FE-03: Supabase Realtime チャネルパターン（Q2: C）

**目的**: 必要最小限のチャネル接続で Realtime 更新を実現する。

### FC-03 — ローカルチャネル（コンポーネント単位）

SeedDetailPage がマウントされている間だけチャネルを保持し、アンマウント時にクリーンアップ。

```tsx
// features/seed/hooks/useSeedRealtime.ts
export function useSeedRealtime(seedId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`seed-detail-${seedId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'seeds',
        filter: `id=eq.${seedId}`,
      }, (payload) => {
        // React Query キャッシュを直接更新（再フェッチ不要）
        queryClient.setQueryData(['seed', seedId], (old: Seed) => ({
          ...old,
          stage: payload.new.stage,
          status: payload.new.status,
          structural_completeness: payload.new.structural_completeness,
          quality_score: payload.new.quality_score,
        }))
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'louges',
        filter: `seed_id=eq.${seedId}`,
      }, (payload) => {
        if (payload.new.status === 'published') {
          queryClient.invalidateQueries({ queryKey: ['seed', seedId] })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [seedId, queryClient])
}
```

### FC-10 — グローバルチャネル（AuthProvider で管理）

ログイン中は常時 `notifications` テーブルを購読し、未読数を `notificationUnreadCountAtom` に反映。

```tsx
// features/auth/components/AuthProvider.tsx（概略）
export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setUnreadCount] = useAtom(notificationUnreadCountAtom)
  const [user] = useAtom(userAtom)

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        setUnreadCount((prev) => prev + 1)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, setUnreadCount])

  return <>{children}</>
}
```

### チャネル命名規則

| チャネル名 | 購読テーブル | 生存期間 |
|---|---|---|
| `seed-detail-{seedId}` | seeds | SeedDetailPage マウント中 |
| `louges-for-seed-{seedId}` | louges | SeedDetailPage マウント中 |
| `notifications-{userId}` | notifications | ログイン中は常時 |

---

## P-FE-04: 楽観的更新パターン

**目的**: FC-05 LogThread のリアクション・返信投稿でレスポンスを即時反映する。

### React Query Mutation + 楽観的更新

```tsx
// features/log/hooks/useReactionMutation.ts
export function useReactionMutation(logId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (type: ReactionType) =>
      apiClient.post(`/logs/${logId}/reactions`, { type }),

    onMutate: async (type) => {
      // 進行中のフェッチをキャンセル
      await queryClient.cancelQueries({ queryKey: ['logs', logId] })
      // 楽観的更新前のスナップショットを保存
      const snapshot = queryClient.getQueryData<Log>(['logs', logId])
      // キャッシュを楽観的に更新
      queryClient.setQueryData(['logs', logId], (old: Log) => ({
        ...old,
        reactions: [...(old.reactions ?? []), { type, user_id: 'me' }],
      }))
      return { snapshot }
    },

    onError: (_err, _vars, context) => {
      // エラー時はスナップショットに戻す
      if (context?.snapshot) {
        queryClient.setQueryData(['logs', logId], context.snapshot)
      }
    },

    onSettled: () => {
      // 成功・失敗どちらでもサーバーデータで再同期
      queryClient.invalidateQueries({ queryKey: ['logs', logId] })
    },
  })
}
```

**適用対象**:
- LogThread リアクションボタン（POST /logs/{id}/reactions）
- LogThread 返信投稿（POST /logs/{id}/replies）

---

## P-FE-05: 認証ガードパターン

**目的**: 未認証ユーザーを保護ルートからログインページにリダイレクトする。

### middleware.ts

```tsx
// middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createServerClient(...)

  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  const protectedRoutes = ['/seeds/new', '/profile']
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url)
    // オープンリダイレクト防止: 同一オリジンのみ許可
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### ルート分類

| 種別 | ルート |
|---|---|
| 保護ルート（要認証） | `/seeds/new`, `/profile/*` |
| 公開ルート | `/`, `/seeds`, `/seeds/[id]`, `/louges`, `/louges/[id]`, `/profile/[userId]`（閲覧のみ）, `/login`, `/register` |

---

## P-FE-06: エラーバウンダリーパターン

**目的**: ページ単位でエラーを捕捉し、アプリ全体のクラッシュを防ぐ。

### error.tsx 配置（NFR-FE-03 準拠）

```tsx
// app/seeds/[id]/error.tsx
'use client'

export default function SeedDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <p className="text-muted-foreground">データの読み込みに失敗しました</p>
      <Button onClick={reset} variant="outline">再試行</Button>
    </div>
  )
}
```

**配置ファイル**:
```
app/
  error.tsx                  ← グローバルフォールバック
  seeds/[id]/error.tsx       ← SeedDetail エラー
  louges/[id]/error.tsx      ← LougeDetail エラー
  profile/[userId]/error.tsx ← Profile エラー
```

---

## P-FE-07: データフェッチ境界パターン

**目的**: Server/Client Component でのデータ取得責務を明確に分ける。

### Server Component — 直接 fetch

```tsx
// app/seeds/[id]/page.tsx（Server Component）
export default async function SeedDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession() // supabase/server-client.ts
  const seed = await apiServer.get<Seed>(`/seeds/${params.id}`, session)
  const logs = await apiServer.get<Log[]>(`/seeds/${params.id}/logs`, session)

  return <SeedDetailView seed={seed} logs={logs} />
}
```

### Client Component — React Query hooks

```tsx
// features/louge/components/LougeListPage.tsx（Client Component）
'use client'

export function LougeListPage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 500)

  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['louges', debouncedQuery],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get(`/louges?page=${pageParam}&q=${debouncedQuery}`),
    getNextPageParam: (last) => last.next_page,
  })
  // ...
}
```

### API クライアント分類

| クライアント | 場所 | 用途 |
|---|---|---|
| `apiServer` | `lib/api/server.ts` | Server Components からの fetch（Bearer token 付与） |
| `apiClient` | `lib/api/client.ts` | Client Components・React Query からの fetch（セッションを自動取得） |
