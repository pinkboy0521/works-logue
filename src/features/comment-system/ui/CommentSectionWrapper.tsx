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
  const [comments] = await Promise.all([
    getCommentsByArticleId(articleId),
    getCommentCount(articleId),
  ]);

  return (
    <CommentSection
      articleId={articleId}
      initialComments={comments}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
    />
  );
}
