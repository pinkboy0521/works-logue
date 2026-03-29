'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { Button } from '@/components/ui/button'

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
// Success state
// ──────────────────────────────────────────
function SuccessMessage() {
  return (
    <div className="w-full max-w-sm mx-auto px-4">
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-border">
          <p className="font-mono-data text-xs text-muted-foreground/60 tracking-widest mb-3">
            LAB / ENTRY — 002
          </p>
          <h1 className="font-display text-2xl text-foreground leading-tight">
            確認メールを送信しました
          </h1>
        </div>
        <div className="px-8 py-7 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            ご登録のメールアドレスに確認リンクを送信しました。
            メールに記載されたリンクをクリックして、登録を完了してください。
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="text-sm text-accent hover:text-accent/80 transition-colors underline-offset-2 hover:underline"
            >
              ログインページへ戻る
            </Link>
          </div>
        </div>
      </div>
      <p className="mt-5 text-center font-mono-data text-xs text-muted-foreground/40 tracking-widest">
        BOTANICAL LABORATORY
      </p>
    </div>
  )
}

// ──────────────────────────────────────────
// Register form
// ──────────────────────────────────────────
export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  function validate() {
    const next: typeof errors = {}
    if (!email) next.email = 'メールアドレスを入力してください'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = '有効なメールアドレスを入力してください'
    if (!password) next.password = 'パスワードを入力してください'
    else if (password.length < 8) next.password = 'パスワードは8文字以上で入力してください'
    if (!confirmPassword) next.confirmPassword = 'パスワード（確認）を入力してください'
    else if (password !== confirmPassword) next.confirmPassword = 'パスワードが一致しません'
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
      const emailRedirectTo = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo },
      })
      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          setApiError('このメールアドレスはすでに登録されています')
        } else {
          setApiError(error.message)
        }
        return
      }
      setSent(true)
    } catch {
      setApiError('接続に失敗しました。ネットワーク接続を確認してください')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return <SuccessMessage />

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      <div className="bg-surface border border-border rounded-lg overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-border">
          <p className="font-mono-data text-xs text-muted-foreground/60 tracking-widest mb-3">
            LAB / ENTRY — 002
          </p>
          <h1 className="font-display text-2xl text-foreground leading-tight">
            新規登録
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            知の探求を始めるための第一歩。
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">

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
              autoComplete="new-password"
              placeholder="8文字以上"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
            />
            <Field
              id="confirmPassword"
              label="Password（確認）"
              type="password"
              autoComplete="new-password"
              placeholder="もう一度入力してください"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              loading={loading}
            >
              アカウントを作成
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 pt-0">
          <p className="text-xs text-center text-muted-foreground">
            すでにアカウントをお持ちの方は{' '}
            <Link
              href="/login"
              className="text-accent hover:text-accent/80 transition-colors underline-offset-2 hover:underline"
            >
              ログイン
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-5 text-center font-mono-data text-xs text-muted-foreground/40 tracking-widest">
        BOTANICAL LABORATORY
      </p>
    </div>
  )
}
