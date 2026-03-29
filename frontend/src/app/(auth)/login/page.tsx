'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { Button } from '@/components/ui/button'

// ──────────────────────────────────────────
// Thin botanical rule divider
// ──────────────────────────────────────────
function BotanicalDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <span className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono-data">
        or
      </span>
      <span className="flex-1 h-px bg-border" />
    </div>
  )
}

// ──────────────────────────────────────────
// Google icon (SVG inline — no emoji)
// ──────────────────────────────────────────
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  )
}

// ──────────────────────────────────────────
// Input field
// ──────────────────────────────────────────
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  id: string
}

function Field({ label, error, id, ...props }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-medium tracking-widest uppercase text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        className={[
          'w-full bg-surface border rounded-md px-3 py-2.5',
          'text-sm text-foreground placeholder:text-muted-foreground/50',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-1 focus:ring-accent/60 focus:border-accent/50',
          error ? 'border-destructive/60' : 'border-border hover:border-border/80',
        ].join(' ')}
        {...props}
      />
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  )
}

// ──────────────────────────────────────────
// Main form — needs useSearchParams → Suspense boundary
// ──────────────────────────────────────────
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/seeds'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  function validate() {
    const next: typeof errors = {}
    if (!email) next.email = 'メールアドレスを入力してください'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = '有効なメールアドレスを入力してください'
    if (!password) next.password = 'パスワードを入力してください'
    else if (password.length < 8) next.password = 'パスワードは8文字以上で入力してください'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setApiError(null)
    setLoading(true)
    try {
      const supabase = getBrowserClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setApiError(error.message === 'Invalid login credentials'
          ? 'メールアドレスまたはパスワードが正しくありません'
          : error.message)
        return
      }
      // FBR-01: same-origin redirect only
      const safe = redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      router.replace(safe ? redirectTo : '/seeds')
    } catch {
      setApiError('接続に失敗しました。ネットワーク接続を確認してください')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleOAuth() {
    setOauthLoading(true)
    setApiError(null)
    try {
      const supabase = getBrowserClient()
      const safe = redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safe ? redirectTo : '/seeds')}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl },
      })
      if (error) setApiError(error.message)
    } catch {
      setApiError('Google ログインに失敗しました')
      setOauthLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      {/* ── Card ── */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">

        {/* Header stripe */}
        <div className="px-8 pt-8 pb-6 border-b border-border">
          {/* Decorative specimen number */}
          <p className="font-mono-data text-xs text-muted-foreground/60 tracking-widest mb-3">
            LAB / ENTRY — 001
          </p>
          <h1 className="font-display text-2xl text-foreground leading-tight">
            Works Logue
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            研究室へようこそ。知の種を育てましょう。
          </p>
        </div>

        {/* Form body */}
        <div className="px-8 py-7">

          {/* API error */}
          {apiError && (
            <div className="mb-5 px-3 py-2.5 rounded-md border border-destructive/30 bg-destructive/10">
              <p className="text-xs text-destructive">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
            />
            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              loading={loading}
            >
              ログイン
            </Button>
          </form>

          <BotanicalDivider />

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2.5"
            onClick={handleGoogleOAuth}
            loading={oauthLoading}
          >
            {!oauthLoading && <GoogleIcon className="h-4 w-4 text-muted-foreground" />}
            Google でログイン
          </Button>
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 pt-0">
          <p className="text-xs text-center text-muted-foreground">
            アカウントをお持ちでない方は{' '}
            <Link
              href="/register"
              className="text-accent hover:text-accent/80 transition-colors underline-offset-2 hover:underline"
            >
              新規登録
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom note */}
      <p className="mt-5 text-center font-mono-data text-xs text-muted-foreground/40 tracking-widest">
        BOTANICAL LABORATORY
      </p>
    </div>
  )
}

// ──────────────────────────────────────────
// Page export (Suspense required for useSearchParams)
// ──────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
