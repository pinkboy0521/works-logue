import { ArticleEditPage } from "@/pages";

interface ArticleEditProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ArticleEdit({ params }: ArticleEditProps) {
  const { id } = await params;
  return <ArticleEditPage articleId={id} />;
}
