import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared";
import { type User } from "../model";

interface AuthorCardProps {
  user: Pick<User, "id" | "displayName" | "image" | "userId">;
  size?: "small" | "medium" | "large";
  showDisplayName?: boolean;
  clickable?: boolean; // リンクを有効/無効にする
}

/**
 * クリック可能な著者カードコンポーネント
 * ユーザーアイコン+名前をクリックすると著者ページに遷移
 */
export function AuthorCard({
  user,
  size = "medium",
  showDisplayName = true,
  clickable = true,
}: AuthorCardProps) {
  const initials = user.displayName?.slice(0, 1) || "";

  // クリック不可またはuserIdが設定されていない場合は普通の表示
  if (!clickable || !user.userId) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className={getAvatarSize(size)}>
          <AvatarImage src={user.image || ""} alt={user.displayName || ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {showDisplayName && (
          <span className={getTextSize(size)}>
            {user.displayName || "Anonymous"}
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={`/${user.userId}`}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <Avatar className={getAvatarSize(size)}>
        <AvatarImage src={user.image || ""} alt={user.displayName || ""} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      {showDisplayName && (
        <span className={getTextSize(size)}>
          {user.displayName || "Anonymous"}
        </span>
      )}
    </Link>
  );
}

/**
 * アバターのサイズクラスを取得
 */
function getAvatarSize(size: "small" | "medium" | "large"): string {
  switch (size) {
    case "small":
      return "h-6 w-6 shrink-0";
    case "medium":
      return "h-8 w-8 shrink-0";
    case "large":
      return "h-12 w-12 shrink-0";
    default:
      return "h-8 w-8 shrink-0";
  }
}

/**
 * テキストのサイズクラスを取得
 */
function getTextSize(size: "small" | "medium" | "large"): string {
  switch (size) {
    case "small":
      return "text-sm truncate";
    case "medium":
      return "font-medium text-foreground truncate";
    case "large":
      return "text-lg font-semibold truncate";
    default:
      return "font-medium text-foreground truncate";
  }
}
