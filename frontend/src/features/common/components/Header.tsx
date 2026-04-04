'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAtomValue } from 'jotai'
import { useQueryClient } from '@tanstack/react-query'
import { LogOut, User as UserIcon } from 'lucide-react'
import { userAtom } from '@/store/atoms'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { NotificationDropdown } from '@/features/notification/components/NotificationDropdown'
import { cn } from '@/lib/utils'

// ── Nav link ────────────────────────────────────────────────
function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'relative text-sm font-body tracking-wide transition-colors duration-150 px-1 py-0.5',
        active
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
      {active && (
        <span className="absolute -bottom-px left-0 right-0 h-px bg-accent/60" />
      )}
    </Link>
  )
}

// ── User dropdown menu ───────────────────────────────────────
function UserMenu({ userId, displayName, avatarUrl }: {
  userId: string
  displayName: string
  avatarUrl: string | null
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  async function handleSignOut() {
    setSigningOut(true)
    try {
      const supabase = getBrowserClient()
      await supabase.auth.signOut()
      queryClient.clear()
      router.push('/')
    } finally {
      setSigningOut(false)
      setOpen(false)
    }
  }

  const initials = displayName.slice(0, 2).toUpperCase() || '??'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/60"
        aria-label="ユーザーメニュー"
      >
        <Avatar className="w-7 h-7 ring-1 ring-border hover:ring-accent/40 transition-all duration-150">
          <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
          <AvatarFallback className="text-xs font-mono bg-surface-raised text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-mono text-muted-foreground/60 tracking-widest uppercase mb-0.5">
              Researcher
            </p>
            <p className="text-sm text-foreground font-medium truncate">{displayName}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href={`/profile/${userId}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors duration-100"
            >
              <UserIcon className="w-3.5 h-3.5" />
              プロフィール
            </Link>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors duration-100 disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              {signingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Header ──────────────────────────────────────────────
export function Header() {
  const user = useAtomValue(userAtom)

  // isLoading: userAtom が初期化前（sessionAtom も確認するが、
  // AuthProvider が非同期で setUser するため null と「未ロード」を区別できない。
  // AuthProvider が完了するまでの短い間はスケルトンを表示する）
  // シンプルな実装: マウント後 300ms 以内は skeleton
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-surface/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-content mx-auto px-4 h-full flex items-center gap-6">

        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 font-display text-lg text-foreground tracking-tight hover:text-accent/90 transition-colors duration-150"
        >
          works-logue
        </Link>

        {/* Specimen divider */}
        <span className="hidden sm:block w-px h-4 bg-border" />

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-5">
          <NavLink href="/seeds" label="Seeds" />
          <NavLink href="/louges" label="Louges" />
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        {!mounted ? (
          <Skeleton className="w-7 h-7 rounded-full" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <UserMenu
              userId={user.id}
              displayName={user.display_name || user.username || 'User'}
              avatarUrl={user.avatar_url}
            />
          </div>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">ログイン</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
