import { auth } from "@/auth";
import { getArticleForEdit, getAllTopics } from "@/entities";
import { redirect } from "next/navigation";
import { ArticleEditPageClient } from "./ArticleEditPageClient";

interface ArticleEditPageProps {
  articleId: string;
}

export async function ArticleEditPage({ articleId }: ArticleEditPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [article, topics] = await Promise.all([
    getArticleForEdit(articleId, session.user.id),
    getAllTopics(),
  ]);

  if (!article) {
    redirect("/dashboard");
  }

  return (
    <ArticleEditPageClient
      article={article}
      topics={topics}
      userId={session.user.id}
    />
  );
}
