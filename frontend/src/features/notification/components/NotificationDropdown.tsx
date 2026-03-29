'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAtom } from 'jotai'
import { Bell, Sprout, BookOpen, Zap } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { notificationUnreadCountAtom } from '@/store/atoms'
import type { Notification, NotificationType, PaginatedResponse } from '@/types'

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHr / 24)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  new_log: <Sprout className="w-3.5 h-3.5 text-growth" />,
  louge_bloomed: <BookOpen className="w-3.5 h-3.5 text-accent" />,
  bloom_near: <Zap className="w-3.5 h-3.5 text-accent" />,
}

function getNotificationHref(notification: Notification): string {
  switch (notification.type) {
    case 'new_log':
      return `/seeds/${notification.reference_id}`
    case 'louge_bloomed':
      return `/louges/${notification.reference_id}`
    case 'bloom_near':
      return `/seeds/${notification.reference_id}`
    default:
      return '/'
  }
}

interface NotificationItemProps {
  notification: Notification
  onClick: () => void
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-raised transition-colors duration-100 ${
        !notification.is_read ? 'bg-surface-raised/50' : ''
      }`}
    >
      <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5">
        {NOTIFICATION_ICONS[notification.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground leading-relaxed line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
      {!notification.is_read && (
        <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
      )}
    </button>
  )
}

export function NotificationDropdown() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useAtom(notificationUnreadCountAtom)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Notification>>('/api/v1/notifications?per_page=20'),
    enabled: isOpen,
  })

  const notifications = data?.items ?? []

  // Mark all as read when dropdown opens
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      apiClient
        .put<void>('/api/v1/notifications/read-all', {})
        .then(() => {
          setUnreadCount(0)
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        })
        .catch(() => {
          // silently fail — unread badge will be stale but not critical
        })
    }
  }, [isOpen, unreadCount, setUnreadCount, queryClient])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  function handleNotificationClick(notification: Notification) {
    setIsOpen(false)
    router.push(getNotificationHref(notification))
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors duration-150"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 rounded-full bg-destructive text-white text-xs font-mono flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-80 bg-surface border border-border rounded-lg shadow-card-hover z-50 overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Notifications
            </span>
            {notifications.length > 0 && (
              <span className="text-xs text-muted-foreground font-mono">
                {notifications.length}
              </span>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-raised border border-border/50 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
