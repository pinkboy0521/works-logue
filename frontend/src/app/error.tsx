'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 text-center">
        <h2 className="mb-2 font-display text-xl font-semibold text-foreground">
          エラーが発生しました
        </h2>
        <p className="mb-1 text-sm text-destructive">
          {error.message || '予期しないエラーが発生しました'}
        </p>
        {error.digest && (
          <p className="mb-6 text-xs text-muted-foreground">
            エラーID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface-raised"
        >
          再試行
        </button>
      </div>
    </div>
  );
}
