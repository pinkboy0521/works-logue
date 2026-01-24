import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserById } from "@/entities/user";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Avatar, AvatarFallback, AvatarImage, Badge } from "@/shared";
import Link from "next/link";
import { Settings, MapPin, Globe, Calendar } from "lucide-react";
import type { UserWithProfile } from "@/entities/user/model/types";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // 現在のユーザー情報を取得
  const user: UserWithProfile | null = await getUserById(session.user.id);
  
  if (!user) {
    redirect("/login");
  }

  const formatJoinDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
    }).format(new Date(date));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* プロフィール概要カード */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 md:h-24 md:w-24">
                <AvatarImage src={user.image || ""} alt="プロフィール画像" />
                <AvatarFallback className="text-2xl">
                  {user.displayName?.charAt(0) || "？"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-xl md:text-2xl">
                  {user.displayName || "未設定"}
                </CardTitle>
                <CardDescription className="text-base">
                  @{user.userId || "未設定"}
                </CardDescription>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/mypage/profile/edit" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                編集する
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 基本情報 */}
          {user.bio && (
            <div>
              <h3 className="font-semibold mb-2">自己紹介</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}
          
          {user.statusMessage && (
            <div>
              <h3 className="font-semibold mb-2">ひとこと</h3>
              <p className="text-muted-foreground">{user.statusMessage}</p>
            </div>
          )}

          {/* メタ情報 */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {user.location}
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <Link 
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {user.website}
                </Link>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatJoinDate(user.createdAt)}に登録
            </div>
          </div>
        </CardContent>
      </Card>

      {/* スキル・技術カード */}
      {user.userSkills && user.userSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>スキル・技術</CardTitle>
            <CardDescription>
              あなたが持っているスキルや技術領域
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.userSkills.map((userSkill: { skill: { id: string; name: string } }) => (
                <Badge key={userSkill.skill.id} variant="secondary">
                  {userSkill.skill.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 職業・役割カード */}
      {user.userOccupations && user.userOccupations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>職業・役割</CardTitle>
            <CardDescription>
              あなたの職業や担当している役割
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.userOccupations.map((userOccupation: { occupation: { id: string; name: string } }) => (
                <Badge key={userOccupation.occupation.id} variant="outline">
                  {userOccupation.occupation.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* アクション */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/mypage/articles" className="flex items-center gap-2 justify-center">
            <Settings className="h-4 w-4" />
            投稿した記事を見る
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/" className="flex items-center gap-2 justify-center">
            <Globe className="h-4 w-4" />
            トップページに戻る
          </Link>
        </Button>
      </div>
    </div>
  );
}