export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Actions Skeleton */}
      <div className="flex justify-between items-center mb-6 p-4 bg-card border-b border-border">
        <div className="h-7 bg-muted animate-pulse rounded w-32"></div>
        <div className="flex space-x-3">
          <div className="h-9 bg-muted animate-pulse rounded w-24"></div>
          <div className="h-9 bg-muted animate-pulse rounded w-16"></div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title Input Skeleton */}
        <div className="h-12 bg-muted animate-pulse rounded"></div>

        {/* Topic Selection Skeleton */}
        <div>
          <div className="h-4 bg-muted animate-pulse rounded w-16 mb-2"></div>
          <div className="h-10 bg-muted animate-pulse rounded"></div>
        </div>

        {/* Editor Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-300px)]">
          <div className="bg-card border rounded-lg p-4">
            <div className="h-6 bg-muted animate-pulse rounded w-16 mb-3"></div>
            <div className="h-full bg-muted animate-pulse rounded"></div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="h-6 bg-muted animate-pulse rounded w-20 mb-3"></div>
            <div className="h-full bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
