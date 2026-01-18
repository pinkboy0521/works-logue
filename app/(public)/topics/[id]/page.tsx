import { redirect } from "next/navigation";

interface TopicDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: TopicDetailPageProps) {
  const { id } = await params;

  // 新しい統合検索ページにリダイレクト
  redirect(`/search?topic=${id}`);
}
