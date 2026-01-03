"use server";

import { auth } from "@/auth";
import { deleteArticle } from "@/entities/article";
import { redirect } from "next/navigation";

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
