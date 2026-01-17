import { getCommentsByArticleId, getCommentCount } from "@/entities";
import { CommentSection } from "./CommentSection";

interface CommentSectionWrapperProps {
  articleId: string;
  currentUserId?: string;
  isAdmin?: boolean;
}

export async function CommentSectionWrapper({
  articleId,
  currentUserId,
  isAdmin = false,
}: CommentSectionWrapperProps) {
  const [comments, count] = await Promise.all([
    getCommentsByArticleId(articleId),
    getCommentCount(articleId),
  ]);

  return (
    <CommentSection
      articleId={articleId}
      initialComments={comments}
      initialCount={count}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
    />
  );
}
