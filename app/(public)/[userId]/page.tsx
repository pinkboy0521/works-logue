import { AuthorProfilePage } from "@/pages";

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

/**
 * ユーザープロフィールページ（記事一覧統合）
 * /{userId} でアクセスできる著者のプロフィールページ
 */
export default async function Page({ params, searchParams }: PageProps) {
  const { userId } = await params;
  const { page } = await searchParams;
  const pageNum = parseInt(page || "1", 10);

  return <AuthorProfilePage userId={userId} page={pageNum} />;
}

// メタデータ
export async function generateMetadata({ params }: PageProps) {
  const { userId } = await params;
  
  // TODO: ユーザー情報を取得してメタデータを動的生成することも可能
  return {
    title: `@${userId} のプロフィール | Works Logue`,
    description: `${userId} さんのプロフィールページ`,
  };
}