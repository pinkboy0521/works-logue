"use server";

import { auth } from "@/auth";
import { createDraftArticle, deleteArticle } from "@/entities/article";
import { redirect } from "next/navigation";

/**
 * 新規記事作成のServer Action
 */
export async function createNewArticleAction() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    const newArticle = await createDraftArticle(session.user.id);
    redirect(`/articles/${newArticle.id}/edit`);
  } catch (error) {
    console.error("Error creating new article:", error);
    throw error;
  }
}

/**
 * 記事削除のServer Action
 */
export async function deleteArticleAction(articleId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    await deleteArticle(articleId, session.user.id);
    redirect("/dashboard");
  } catch (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
}
