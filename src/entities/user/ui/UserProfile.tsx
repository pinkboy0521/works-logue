import { Avatar, AvatarFallback } from "@/shared";
import { type User } from "../model";
/**
 * ユーザープロフィール表示コンポーネント
 */
export function UserProfile({ user }: { user: User }) {
  const initials =
    user.displayName
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{user.displayName}</span>
    </div>
  );
}
