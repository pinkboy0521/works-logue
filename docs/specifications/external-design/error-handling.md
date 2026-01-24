# Works Logue - エラーハンドリング・通知

**バージョン**: 1.0  
**最終更新**: 2026年1月24日  
**ステータス**: 実装済み

## 1. エラーハンドリング戦略

### 1.1 エラー分類

| 分類                   | 説明                           | 対応方針                           |
| ---------------------- | ------------------------------ | ---------------------------------- |
| **システムエラー**     | サーバーエラー、DB接続エラー等 | Error Boundary、フォールバック表示 |
| **ユーザーエラー**     | 入力値不正、権限不足等         | インライン表示、明確なメッセージ   |
| **ネットワークエラー** | 接続失敗、タイムアウト等       | リトライ機能、オフライン通知       |
| **認証エラー**         | セッション切れ、無効トークン等 | 自動リダイレクト、再認証           |

### 1.2 エラーレベル定義

```typescript
// 実装: src/shared/lib/error-levels.ts
export enum ErrorLevel {
  INFO = "info", // 情報通知（青）
  WARNING = "warning", // 警告（黄）
  ERROR = "error", // エラー（赤）
  SUCCESS = "success", // 成功（緑）
}

export interface AppError {
  id: string;
  level: ErrorLevel;
  title: string;
  message: string;
  action?: string;
  timestamp: Date;
  context?: Record<string, any>;
}
```

## 2. グローバルエラーハンドリング

### 2.1 Error Boundary

```tsx
// 実装: src/shared/ui/error-boundary/ErrorBoundary.tsx
"use client";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export function ErrorBoundary({
  children,
  fallback: Fallback,
}: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(new Error(event.message));
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      setError(new Error(event.reason));
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  if (error) {
    if (Fallback) {
      return <Fallback error={error} reset={() => setError(null)} />;
    }

    return <DefaultErrorFallback error={error} reset={() => setError(null)} />;
  }

  return <>{children}</>;
}
```

### 2.2 デフォルトエラーフォールバック

```tsx
// 実装: src/shared/ui/error-boundary/DefaultErrorFallback.tsx
interface DefaultErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export function DefaultErrorFallback({
  error,
  reset,
}: DefaultErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <AlertTriangleIcon className="w-16 h-16 text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">エラーが発生しました</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        申し訳ございません。予期しないエラーが発生しました。
        ページを再読み込みするか、しばらく時間をおいてから再度お試しください。
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="default">
          再試行
        </Button>
        <Button asChild variant="outline">
          <Link href="/">ホームへ戻る</Link>
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 max-w-2xl">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            エラー詳細（開発環境のみ）
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
```

### 2.3 Next.js App Router エラーページ

#### 2.3.1 グローバルエラーページ

```tsx
// 実装: app/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ログ送信
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircleIcon className="w-6 h-6 text-destructive" />
            エラーが発生しました
          </CardTitle>
          <CardDescription>
            申し訳ございません。予期しないエラーが発生しました。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              この問題が続く場合は、お手数ですがサポートまでお問い合わせください。
            </p>
            {error.digest && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs font-mono">エラーID: {error.digest}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button onClick={reset} className="flex-1">
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            再試行
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">
              <HomeIcon className="w-4 h-4 mr-2" />
              ホームへ戻る
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

#### 2.3.2 404 Not Foundページ

```tsx
// 実装: app/not-found.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ページが見つかりません | Works Logue",
};

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">ページが見つかりません</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          お探しのページは削除されたか、URLが変更された可能性があります。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">ホームへ戻る</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search">記事を検索</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## 3. フォームエラーハンドリング

### 3.1 フォームバリデーションエラー

```tsx
// 実装: src/shared/ui/form/FormField.tsx
import { useFormContext } from "react-hook-form";

interface FormFieldProps {
  name: string;
  children: React.ReactNode;
}

export function FormField({ name, children }: FormFieldProps) {
  const {
    formState: { errors },
    register,
  } = useFormContext();

  const error = errors[name];

  return (
    <div className="space-y-2">
      {children}
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="w-4 h-4" />
          <AlertDescription>{error.message as string}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

### 3.2 非同期フォーム送信エラー

```tsx
// 実装: src/features/auth/ui/LoginForm.tsx
export function LoginForm() {
  const [submitError, setSubmitError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setSubmitError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setSubmitError("メールアドレスまたはパスワードが正しくありません。");
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setSubmitError(
        "ログインに失敗しました。しばらく時間をおいてから再度お試しください。",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {submitError && (
        <Alert variant="destructive">
          <AlertCircleIcon className="w-4 h-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <FormField name="email">
        <Label>メールアドレス</Label>
        <Input {...register("email")} disabled={isLoading} />
      </FormField>

      <FormField name="password">
        <Label>パスワード</Label>
        <Input type="password" {...register("password")} disabled={isLoading} />
      </FormField>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
        ログイン
      </Button>
    </form>
  );
}
```

## 4. API エラーハンドリング

### 4.1 Server Actions エラー処理

```tsx
// 実装: src/entities/article/api/actions.ts
import { redirect } from "next/navigation";

export async function createArticle(prevState: any, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        error: "認証が必要です。",
        success: false,
      };
    }

    const validatedData = createArticleSchema.parse({
      title: formData.get("title"),
      content: formData.get("content"),
      topicId: formData.get("topicId"),
    });

    const article = await prisma.article.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
      },
    });

    return {
      success: true,
      article: article,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: "入力データが不正です。",
        details: error.errors,
        success: false,
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          error: "既に同名の記事が存在します。",
          success: false,
        };
      }
    }

    console.error("記事作成エラー:", error);
    return {
      error:
        "記事の作成に失敗しました。しばらく時間をおいてから再度お試しください。",
      success: false,
    };
  }
}
```

### 4.2 API Route エラー処理

```tsx
// 実装: app/api/articles/route.ts
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "認証が必要です" },
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validatedData = createArticleSchema.parse(body);

    const article = await prisma.article.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "入力データが不正です",
            details: error.errors,
          },
        },
        { status: 400 },
      );
    }

    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "内部サーバーエラー",
        },
      },
      { status: 500 },
    );
  }
}
```

## 5. 通知システム

### 5.1 Toast通知（将来実装予定）

```tsx
// 予定: src/shared/ui/toast/Toast.tsx
interface ToastProps {
  variant?: "default" | "destructive" | "success";
  title?: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback((props: ToastProps) => {
    const id = Math.random().toString(36);
    setToasts((prev) => [...prev, { ...props, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toast, dismiss, toasts };
}
```

### 5.2 成功・エラー通知の使用例

```tsx
// 使用例: フォーム送信後の通知
const { toast } = useToast();

const handleSubmit = async (data: FormData) => {
  try {
    await submitForm(data);

    toast({
      variant: "success",
      title: "保存完了",
      description: "記事を正常に保存しました。",
    });
  } catch (error) {
    toast({
      variant: "destructive",
      title: "エラー",
      description: "保存に失敗しました。再度お試しください。",
    });
  }
};
```

## 6. ローディング状態

### 6.1 ページレベルローディング

```tsx
// 実装: app/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <Skeleton className="h-48 m-4 rounded-md" />
              <CardFooter>
                <Skeleton className="h-4 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 6.2 コンポーネントレベルローディング

```tsx
// 実装: src/widgets/article-list/ui/ArticleListSkeleton.tsx
export function ArticleListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-4/5" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardHeader>
          <Skeleton className="h-48 mx-6 mb-4" />
          <CardFooter>
            <div className="flex justify-between w-full">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

## 7. オフライン対応

### 7.1 ネットワーク状態検知

```tsx
// 実装: src/shared/lib/network-status.ts
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
```

### 7.2 オフライン通知

```tsx
// 実装: src/widgets/offline-banner/ui/OfflineBanner.tsx
export function OfflineBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <Alert className="rounded-none border-t-0 border-l-0 border-r-0">
      <WifiOffIcon className="w-4 h-4" />
      <AlertDescription>
        インターネット接続がありません。一部の機能が制限されています。
      </AlertDescription>
    </Alert>
  );
}
```

---

## 変更履歴

| 日付       | バージョン | 変更者   | 変更内容                                             |
| ---------- | ---------- | -------- | ---------------------------------------------------- |
| 2026-01-24 | 1.0        | システム | 外部設計書からエラーハンドリング・通知を分離・独立化 |
