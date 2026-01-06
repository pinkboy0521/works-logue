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

  let newArticle;
  try {
    newArticle = await createDraftArticle(session.user.id);
  } catch (error) {
    console.error("Error creating new article:", error);
    throw new Error("記事の作成に失敗しました");
  }

  // 成功時のみリダイレクト
  redirect(`/articles/${newArticle.id}/edit`);
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
  } catch (error) {
    console.error("Error deleting article:", error);
    throw new Error("記事の削除に失敗しました");
  }

  // 成功時のみリダイレクト
  redirect("/dashboard");
}
