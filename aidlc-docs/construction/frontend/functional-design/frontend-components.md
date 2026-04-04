# Frontend Components — Unit 2: frontend

## コンポーネント階層マップ

```
app/layout.tsx
  └── AuthProvider（FC-01）
        ├── Header（FC-11）
        │     ├── Logo → `/` へ遷移
        │     ├── NavLinks（Seeds / Louges）
        │     ├── NotificationDropdown（FC-10）— 認証済み時のみ
        │     ├── UserMenu（認証済み時）— アバター + ドロップダウン（プロフィール / ログアウト）
        │     └── LoginButton（未認証時）→ `/login` へ遷移
        └── [各ページ]

app/page.tsx → SeedFeedPage（FC-02）
app/seeds/new/page.tsx → SeedFormPage（FC-04）
app/seeds/[id]/page.tsx → SeedDetailPage（FC-03）
app/(auth)/login/page.tsx → LoginPage
app/(auth)/register/page.tsx → RegisterPage
app/louges/page.tsx → LougeListPage（FC-06）
app/louges/[id]/page.tsx → LougeDetailPage（FC-07）
app/profile/[userId]/page.tsx → ProfilePage（FC-08）
```

---

## FC-01: AuthProvider

**場所**: `features/auth/components/AuthProvider.tsx`

**Props**: なし（React Context Provider）

**提供するContext**:
```typescript
interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}
```

**状態**:
- `userAtom`: グローバルユーザー状態（Jotai）
- `sessionAtom`: Supabase セッション状態

**ロジック**:
- `supabase.auth.getSession()` でセッション初期化
- `supabase.auth.onAuthStateChange()` を購読
- SIGNED_OUT 時に React Query キャッシュをクリア

**API 連携**: なし（Supabase Auth SDK のみ）

---

## FC-02: SeedFeedPage

**場所**: `features/seed/components/SeedFeedPage.tsx`
**ページ**: `app/page.tsx`, `app/seeds/page.tsx`

**Props**: なし

**状態**:
```typescript
// React Query（useInfiniteQuery）
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(...)
```

**子コンポーネント**:
```
SeedFeedPage
  ├── SeedCard（× N件）
  │     ├── GrowthIndicator（FC-09）
  │     ├── SeedTypeLabel
  │     ├── TagList
  │     └── AuthorAvatar
  └── InfiniteScrollTrigger（Intersection Observer）
```

**SeedCard Props**:
```typescript
interface SeedCardProps {
  seed: Seed
  onClick?: () => void
}
```

**ユーザーインタラクション**:
- カードクリック → `/seeds/[id]` へ遷移
- スクロール末尾到達 → `fetchNextPage()`

**API 連携**:
- `GET /seeds?page=N&per_page=20`（React Query: `useInfiniteQuery`）

---

## FC-03: SeedDetailPage

**場所**: `features/seed/components/SeedDetailPage.tsx`
**ページ**: `app/seeds/[id]/page.tsx`

**Props**:
```typescript
interface SeedDetailPageProps {
  params: { id: string }
}
```

**状態**:
```typescript
const { data: seed } = useQuery(['seed', id], ...)
const { data: logs } = useQuery(['logs', id], ...)
// Supabase Realtime channel
```

**子コンポーネント**:
```
SeedDetailPage
  ├── SeedHeader（タイトル・タイプ・投稿者・日時）
  ├── SeedContent（本文）
  ├── TagList
  ├── GrowthIndicator（FC-09）—— Realtime 更新あり
  ├── ParentLougeBanner（parent_louge_id がある場合のみ）
  │     → 親 Louge へのリンクバナー
  ├── LougeStatusBanner（seed.status === 'blooming' または seed.stage === 'bloomed' の場合）
  │     → blooming: 「Louge 生成中...」（スピナー表示）
  │     → bloomed:  「Louge が完成しました」＋「Lougeを見る →」ボタン（/louges/{louge_id} へ遷移）
  ├── LogThread（FC-05）
  └── LogInputForm（認証済みユーザーのみ表示）
```

**ユーザーインタラクション**:
- ログ投稿フォームへの入力・送信
- Realtime で GrowthIndicator が自動更新
- LougeStatusBanner の「Lougeを見る」ボタン → `/louges/{louge_id}` へ遷移

**API 連携**:
- `GET /seeds/{id}`（レスポンスに `louge_id` を含む、stage='bloomed' 時のみ設定）
- `GET /seeds/{id}/logs`
- `POST /seeds/{id}/logs`（LogInputForm から）

**Realtime**:
- `seeds` テーブル: stage / status 変化を購読 → GrowthIndicator 更新
- `louges` テーブル: status が `published` に変化 → LougeStatusBanner 更新（`louge_id` を取得して「Lougeを見る」ボタンを活性化）

---

## FC-04: SeedFormPage

**場所**: `features/seed/components/SeedFormPage.tsx`
**ページ**: `app/seeds/new/page.tsx`

**Props**:
```typescript
// URLクエリで受け取る（Forkフローの場合）
interface SeedFormPageProps {
  searchParams: {
    from_louge?: string   // Fork元 Louge ID
    seed_id?: string      // Fork済みSeed ID（編集モード）
  }
}
```

**状態（Jotai atom）**:
```typescript
// seedFormAtom: SeedFormInput
{
  step: 1 | 2 | 3 | 4
  type: SeedType | null
  title: string
  content: string
  tag_ids: string[]
  cleanse_suggestions: CleanseSuggestion[]
  cleanse_loading: boolean
}
```

**子コンポーネント**:
```
SeedFormPage
  ├── StepIndicator（現在ステップ表示）
  ├── Step1_TypeSelector
  │     └── SeedTypeCard（× 8）
  ├── Step2_ContentInput
  │     ├── TitleInput
  │     ├── ContentTextarea
  │     └── CleanseInlineSuggest（インラインサジェストエリア）
  │           └── CleanseSuggestionItem（× N）
  ├── Step3_TagSelector
  │     └── TagTree（階層タグ選択 UI）
  └── Step4_Confirm
        ├── 各フィールドのサマリー表示
        └── SubmitButton
```

**ユーザーインタラクション**:
- Step 1: タイプカードクリックで選択
- Step 2: content 入力 → 800ms デバウンス後に `POST /seeds/cleanse`
- Step 3: タグクリックで選択/解除（制限なし）
- Step 4: 「投稿する」→ `POST /seeds`

**API 連携**:
- `POST /seeds/cleanse`（デバウンス呼び出し）
- `GET /tags?taxonomy_type=seed_topic`
- `POST /seeds`

---

## FC-05: LogThread

**場所**: `features/log/components/LogThread.tsx`

**Props**:
```typescript
interface LogThreadProps {
  seedId: string
  logs: Log[]
}
```

**子コンポーネント**:
```
LogThread
  └── LogItem（× N件）
        ├── AuthorAvatar
        ├── AuthorName + Timestamp
        ├── LogContent
        ├── AIFacilitationBadge（is_ai_facilitation === true の場合）
        ├── ReactionBar
        │     └── ReactionButton（× 3種：insight / agree / helpful）
        └── ReplyForm（「返信」クリック時にインライン展開）
```

**LogItem Props**:
```typescript
interface LogItemProps {
  log: Log
  depth: 0 | 1  // 0=トップレベル, 1=返信（最大2階層）
  seedId: string
}
```

**ユーザーインタラクション**:
- リアクションボタンクリック → `POST /logs/{id}/reactions`（楽観的更新）
- 「返信」クリック → ReplyForm インライン展開
- ReplyForm 送信 → `POST /logs/{id}/replies`（楽観的更新）

**API 連携**:
- `POST /logs/{id}/reactions`
- `POST /logs/{id}/replies`

---

## FC-06: LougeListPage

**場所**: `features/louge/components/LougeListPage.tsx`
**ページ**: `app/louges/page.tsx`

**Props**: なし

**状態**:
```typescript
const [searchQuery, setSearchQuery] = useState('')
const { data, fetchNextPage } = useInfiniteQuery(['louges', searchQuery], ...)
```

**子コンポーネント**:
```
LougeListPage
  ├── SearchInput（検索バー）
  ├── LougeCard（× N件）
  │     ├── PatternName
  │     ├── Title
  │     ├── ContributorAvatars（最大5人）
  │     └── ForkCount
  └── InfiniteScrollTrigger
```

**LougeCard Props**:
```typescript
interface LougeCardProps {
  louge: Louge
}
```

**ユーザーインタラクション**:
- SearchInput 入力 → 500ms デバウンス → `GET /louges?q=xxx`
- カードクリック → `/louges/[id]` へ遷移

**API 連携**:
- `GET /louges?page=N&per_page=20&q={query}`

---

## FC-07: LougeDetailPage

**場所**: `features/louge/components/LougeDetailPage.tsx`
**ページ**: `app/louges/[id]/page.tsx`

**Props**:
```typescript
interface LougeDetailPageProps {
  params: { id: string }
}
```

**子コンポーネント**:
```
LougeDetailPage
  ├── LougeHeader（PatternName + Title）
  ├── LougeArticle
  │     ├── ContextSection
  │     ├── ProblemSection
  │     ├── SolutionSection
  │     └── FullContent（markdown レンダリング）
  ├── ContributorList
  │     └── ContributorItem（× N: アバター + 名前 + 貢献スコア）
  ├── ForkSeedList（fork_seeds がある場合）
  │     └── SeedCard（FC-02 と共通）
  └── ForkButton（ログイン済み + status === 'published' のみ表示）
```

**ForkButton Props**:
```typescript
interface ForkButtonProps {
  lougeId: string
  onSuccess: (seedId: string) => void
}
```

**ユーザーインタラクション**:
- ForkButton クリック → `POST /louges/{id}/fork` → `/seeds/new?from_louge={id}&seed_id={newSeedId}`

**API 連携**:
- `GET /louges/{id}`
- `POST /louges/{id}/fork`

---

## FC-08: ProfilePage

**場所**: `features/profile/components/ProfilePage.tsx`
**ページ**: `app/profile/[userId]/page.tsx`

**Props**:
```typescript
interface ProfilePageProps {
  params: { userId: string }
}
```

**子コンポーネント**:
```
ProfilePage
  ├── ProfileHeader
  │     ├── AvatarImage
  │     ├── DisplayName + Username
  │     ├── Bio
  │     ├── IndustryTagList
  │     ├── RoleTagList
  │     └── EditButton（自分のプロフィールの場合のみ）
  ├── ScoreCard
  │     ├── TotalScore（大きく表示）
  │     └── ScoreBreakdownAccordion（クリックで展開）
  └── BadgeList
        └── BadgeItem（× N: バッジアイコン + Lougeリンク）
```

**ユーザーインタラクション**:
- EditButton クリック → プロフィール編集モーダル表示
- ScoreBreakdownAccordion 展開 → `GET /users/{id}/score-history` を遅延ロード
- BadgeItem クリック → `/louges/[louge_id]` へ遷移

**API 連携**:
- `GET /users/{userId}/profile`
- `GET /users/{userId}/score-history`（遅延ロード）
- `PUT /users/me`（編集時）

---

## FC-09: GrowthIndicator

**場所**: `features/seed/components/GrowthIndicator.tsx`

**Props**:
```typescript
interface GrowthIndicatorProps {
  stage: GrowthStage
  structural_completeness: number  // 0.0〜1.0（プログレスバー用）
  size?: number  // px（default: 64）
  showLabel?: boolean  // ステージ名テキスト表示（default: true）
}
```

**SVGアニメーション**:
```
GrowthIndicator
  └── SVGContainer
        ├── SeedShape（stage: seed）
        ├── SproutShape（stage: sprout）
        ├── GrowthShape（stage: growth）
        ├── NearBloomShape（stage: near_bloom）
        ├── FloweringShape（stage: flowering）— パルスアニメーション
        └── BloomedShape（stage: bloomed）— 静止・発光エフェクト
  └── CompletionProgressBar（structural_completeness 可視化）
  └── StageLabel（showLabel === true の場合）
```

**状態管理**: Props のみ（ステートレスコンポーネント）

**アニメーション実装**:
- CSS Transitions / Framer Motion を使用
- ステージ変化時: 0.5秒 fade + grow トランジション
- `flowering`: Tailwind `animate-pulse` 相当
- `bloomed`: CSS `drop-shadow` + `scale-up` 静止エフェクト

---

## FC-10: NotificationDropdown

**場所**: `features/notification/components/NotificationDropdown.tsx`

**Props**: なし

**状態**:
```typescript
const [isOpen, setIsOpen] = useState(false)
const [unreadCount] = useAtom(notificationUnreadCountAtom)
const { data: notifications } = useQuery(['notifications'], ...)
```

**子コンポーネント**:
```
NotificationDropdown
  ├── BellIcon + UnreadBadge
  └── DropdownPanel（isOpen === true の場合）
        ├── NotificationItem（× N件）
        │     ├── NotificationIcon（type別）
        │     ├── NotificationMessage
        │     ├── Timestamp
        │     └── NavigationLink（reference_id に応じたURL）
        └── EmptyState（通知なしの場合）
```

**NotificationItem Props**:
```typescript
interface NotificationItemProps {
  notification: Notification
}
```

**ユーザーインタラクション**:
- BellIcon クリック → isOpen トグル
- ドロップダウン開く → `PUT /notifications/read-all`（全件既読）
- NotificationItem クリック → 対象リソースへ遷移
  - `new_log` → `/seeds/{reference_id}`
  - `louge_bloomed` → `/louges/{reference_id}`
  - `bloom_near` → `/seeds/{reference_id}`

**API 連携**:
- `GET /notifications?per_page=20`
- `PUT /notifications/read-all`

**Realtime**:
- `notifications` テーブルの INSERT を購読（FBR-06 参照）

---

## FC-11: Header

**場所**: `features/common/components/Header.tsx`
**配置**: `app/layout.tsx` 内（全ページ共通）

**子コンポーネント**:
```
Header
  ├── Logo（テキスト or SVG）→ `/` へ遷移
  ├── NavLinks
  │     ├── 「Seeds」→ `/`
  │     └── 「Louges」→ `/louges`
  ├── NotificationDropdown（FC-10）— 認証済み時のみ表示
  ├── UserMenu（認証済み時）
  │     ├── UserAvatar（アバター画像）
  │     └── DropdownMenu
  │           ├── 「プロフィール」→ `/profile/{userId}`
  │           └── 「ログアウト」→ signOut()
  └── LoginButton（未認証時）→ `/login` へ遷移
```

**状態**:
```typescript
const { user, isLoading } = useAuth()  // AuthContext から取得
const [menuOpen, setMenuOpen] = useState(false)
```

**ユーザーインタラクション**:
- Logo クリック → `/`
- UserAvatar クリック → UserMenu ドロップダウン開閉
- 「ログアウト」クリック → `signOut()` → `/` へリダイレクト
- 「ログイン」クリック → `/login`

**API 連携**: なし（AuthContext の状態を参照）

---

## FC-12: LoginPage

**場所**: `features/auth/components/LoginPage.tsx`
**ページ**: `app/(auth)/login/page.tsx`

**子コンポーネント**:
```
LoginPage
  ├── Logo
  ├── EmailInput
  ├── PasswordInput
  ├── LoginButton（「ログイン」）
  ├── ErrorMessage（認証失敗時）
  └── RegisterLink → `/register`
```

**状態**:
```typescript
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState<string | null>(null)
const [isLoading, setIsLoading] = useState(false)
```

**ロジック**:
- `supabase.auth.signInWithPassword({ email, password })`
- 成功: `redirect` クエリパラメータがあればそこへ、なければ `/` へ遷移
- 失敗: エラーメッセージを `error` にセット（ページ内表示）

**API 連携**: Supabase Auth SDK（`signInWithPassword`）

---

## FC-13: RegisterPage

**場所**: `features/auth/components/RegisterPage.tsx`
**ページ**: `app/(auth)/register/page.tsx`

**子コンポーネント**:
```
RegisterPage
  ├── Logo
  ├── DisplayNameInput
  ├── EmailInput
  ├── PasswordInput（8文字以上）
  ├── RegisterButton（「アカウント作成」）
  ├── ErrorMessage（登録失敗時）
  └── LoginLink → `/login`
```

**状態**:
```typescript
const [displayName, setDisplayName] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState<string | null>(null)
const [isLoading, setIsLoading] = useState(false)
```

**ロジック**:
- `supabase.auth.signUp({ email, password, options: { data: { display_name } } })`
- 成功: `/` へ遷移（メール確認不要設定の場合）
- 失敗: エラーメッセージを `error` にセット

**バリデーション**:
- `displayName`: 必須、1〜50 文字
- `email`: 必須、メール形式
- `password`: 必須、8 文字以上

**API 連携**: Supabase Auth SDK（`signUp`）

---

## 共通 UI コンポーネント（components/ui/）

| コンポーネント | Props | 用途 |
|---|---|---|
| `Button` | variant, size, disabled, onClick | 汎用ボタン |
| `Card` | children, className | カードコンテナ |
| `Avatar` | src, alt, size | ユーザーアバター |
| `Badge` | label, variant | ラベルバッジ |
| `Toast` | message, type, duration | トースト通知 |
| `Skeleton` | width, height, className | ローディングプレースホルダー |
| `InfiniteScrollTrigger` | onIntersect, isLoading | 無限スクロール監視 |
| `ProgressBar` | value, max, className | プログレスバー |
| `Modal` | isOpen, onClose, title, children | モーダルダイアログ |
| `Tooltip` | content, children | ツールチップ |
