import { auth } from "@/auth";
import { createDraftArticle } from "@/entities";
import { redirect } from "next/navigation";

export default async function NewArticle() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // 記事作成処理
  let newArticle;
  try {
    newArticle = await createDraftArticle(session.user.id);
  } catch (error) {
    console.error("Error creating new article:", error);
    redirect("/dashboard");
  }

  // 記事作成に成功した場合、編集ページにリダイレクト
  redirect(`/articles/${newArticle.id}/edit`);
}
