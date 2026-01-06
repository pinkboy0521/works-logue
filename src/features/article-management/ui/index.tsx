import { Button } from "@/shared";
import { createNewArticleAction, deleteArticleAction } from "../api";

/**
 * 新規記事作成ボタン
 */
export function CreateArticleButton() {
  return (
    <form action={createNewArticleAction}>
      <Button type="submit">新規記事を作成</Button>
    </form>
  );
}

/**
 * 記事削除ボタン
 */
export function DeleteArticleButton({ articleId }: { articleId: string }) {
  const deleteWithId = deleteArticleAction.bind(null, articleId);

  return (
    <form action={deleteWithId}>
      <Button type="submit" variant="destructive">
        削除
      </Button>
    </form>
  );
}
