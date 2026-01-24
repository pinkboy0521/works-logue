import { auth } from "@/auth";
import {
  getArticleForEdit,
  getAllTopics,
  getTagsWithHierarchy,
} from "@/entities";
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

  const [article, topics, tags] = await Promise.all([
    getArticleForEdit(articleId, session.user.id),
    getAllTopics(),
    getTagsWithHierarchy(),
  ]);

  if (!article) {
    redirect("/dashboard");
  }

  return (
    <ArticleEditPageClient
      article={article}
      topics={topics}
      tags={tags}
      userId={session.user.id}
    />
  );
}
