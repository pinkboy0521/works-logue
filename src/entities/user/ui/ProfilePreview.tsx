import { Avatar, AvatarFallback, AvatarImage, Badge } from "@/shared";
import type { UserWithProfile } from "../model/types";

interface ProfilePreviewProps {
  user: UserWithProfile;
}

/**
 * プロフィールプレビューコンポーネント
 * 公開プロフィールページでの表示内容を再現
 */
export function ProfilePreview({ user }: ProfilePreviewProps) {
  const initials =
    user.displayName?.charAt(0)?.toUpperCase() ||
    user.userId?.charAt(0)?.toUpperCase() ||
    "ユ";

  return (
    <div className="space-y-6">
      {/* ユーザー基本情報 */}
      <div className="flex flex-col items-center text-center space-y-4">
        <Avatar className="w-24 h-24">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.displayName || ""} />
          ) : null}
          <AvatarFallback className="text-xl font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{user.displayName || "未設定"}</h2>
          {user.userId && (
            <p className="text-muted-foreground">@{user.userId}</p>
          )}
        </div>
      </div>

      {/* プロフィール詳細 */}
      <div className="space-y-4">
        {user.bio && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              自己紹介
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {user.bio}
            </p>
          </div>
        )}

        {user.userOccupations && user.userOccupations.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              職業
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.userOccupations.map((userOccupation) => (
                <Badge key={userOccupation.occupation.id} variant="secondary">
                  {userOccupation.occupation.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {user.userSkills && user.userSkills.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              スキル
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.userSkills.map((userSkill) => (
                <Badge key={userSkill.skill.id} variant="outline">
                  {userSkill.skill.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!user.bio &&
          (!user.userOccupations || user.userOccupations.length === 0) &&
          (!user.userSkills || user.userSkills.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">プロフィールの詳細情報が未設定です</p>
              <p className="text-xs mt-1">
                右側の編集フォームから設定してください
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
