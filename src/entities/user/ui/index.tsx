import { Avatar, AvatarFallback, Card, CardContent } from "@/shared";
import { type User } from "../model";

/**
 * ユーザーのスケルトン表示コンポーネント
 * ビジネスモデルの基本的なUI表現
 */
export function UserCard({ user }: { user: User }) {
  const initials = user.name
    ?.split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <Card>
      <CardContent className="flex items-center space-x-4 p-4">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ユーザープロフィール表示コンポーネント
 */
export function UserProfile({ user }: { user: User }) {
  const initials = user.name
    ?.split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{user.name}</span>
    </div>
  );
}