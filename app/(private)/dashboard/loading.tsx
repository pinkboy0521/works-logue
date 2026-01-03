import { ArticleListSkeleton } from "@/widgets";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-9 bg-muted animate-pulse rounded w-32"></div>
          <div className="h-9 bg-muted animate-pulse rounded w-32"></div>
        </div>
        <ArticleListSkeleton />
      </div>
    </div>
  );
}
