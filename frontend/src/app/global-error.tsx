'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="ja">
      <body className="bg-background text-foreground antialiased">
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full p-8 border border-border rounded-lg text-center">
            <h2 className="text-xl font-display text-foreground mb-4">
              エラーが発生しました
            </h2>
            <p className="text-destructive mb-2">
              {error.message || '予期しないエラーが発生しました'}
            </p>
            {error.digest && (
              <p className="text-muted-foreground text-xs mb-6">
                エラーID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="px-4 py-2 border border-border text-foreground hover:bg-surface transition-colors rounded-md"
            >
              再試行
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
