"use server";

import { auth } from "@/auth";
import { createDraftArticle } from "@/entities/article";
import { redirect } from "next/navigation";

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
    // エラー時は何もしない（現在のページに留まる）
    throw error;
  }
}
