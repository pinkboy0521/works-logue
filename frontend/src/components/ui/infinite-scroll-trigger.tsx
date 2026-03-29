'use client'

import * as React from 'react'

interface InfiniteScrollTriggerProps {
  onIntersect: () => void
  isLoading?: boolean
  hasMore?: boolean
  rootMargin?: string
  threshold?: number
  className?: string
}

export function InfiniteScrollTrigger({
  onIntersect,
  isLoading = false,
  hasMore = true,
  rootMargin = '200px',
  threshold = 0,
  className,
}: InfiniteScrollTriggerProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const onIntersectRef = React.useRef(onIntersect)
  onIntersectRef.current = onIntersect

  React.useEffect(() => {
    const el = ref.current
    if (!el || !hasMore || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersectRef.current()
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, isLoading, rootMargin, threshold])

  if (!hasMore) return null

  return (
    <div
      ref={ref}
      data-testid="infinite-scroll-trigger"
      className={className}
      aria-hidden="true"
    >
      {isLoading && (
        <div className="flex justify-center py-4">
          <span className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  )
}
