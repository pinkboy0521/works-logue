"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { type Skill, type Occupation } from "@/entities";
import {
  Alert,
  AlertDescription,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Badge,
} from "@/shared";
import type { UserWithProfile } from "@/entities/user/model/types";

interface ProfileSetupFormData {
  displayName: string;
  userId: string;
  bio: string;
  website: string;
  location: string;
  statusMessage: string;
}

interface ProfileSetupFormProps {
  user: UserWithProfile | null;
  onComplete: () => void;
}

export function ProfileSetupForm({ user, onComplete }: ProfileSetupFormProps) {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.image || null,
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [skills, setSkills] = useState<Record<string, Skill[]>>({});
  const [occupations, setOccupations] = useState<Record<string, Occupation[]>>(
    {},
  );
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedOccupations, setSelectedOccupations] = useState<Set<string>>(
    new Set(),
  );
  const [skillsLoaded, setSkillsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileSetupFormData>({
    defaultValues: {
      displayName: user?.displayName || "",
      userId: user?.userId || "",
      bio: user?.bio || "",
      website: user?.website || "",
      location: user?.location || "",
      statusMessage: user?.statusMessage || "",
    },
  });

  const loadSkillsAndOccupations = async () => {
    if (skillsLoaded) return;

    try {
      const response = await fetch("/api/skills-occupations");
      if (!response.ok) {
        throw new Error("Failed to fetch skills and occupations");
      }

      const data = await response.json();
      setSkills(data.skills);
      setOccupations(data.occupations);

      // 既存の選択状態を復元
      if (user?.userSkills) {
        setSelectedSkills(new Set(user.userSkills.map((us) => us.skill.id)));
      }
      if (user?.userOccupations) {
        setSelectedOccupations(
          new Set(user.userOccupations.map((uo) => uo.occupation.id)),
        );
      }

      setSkillsLoaded(true);
    } catch (error) {
      console.error("Failed to load skills/occupations:", error);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!session?.user?.id) {
      setError("セッションが見つかりません。再度ログインしてください。");
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    try {
      // ファイルサイズチェック (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("ファイルサイズは5MB以下にしてください");
      }

      // ファイル形式チェック
      if (!file.type.startsWith("image/")) {
        throw new Error("画像ファイルを選択してください");
      }

      // 署名付きURL取得（API Route経由）
      const signatureResponse = await fetch("/api/upload/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!signatureResponse.ok) {
        throw new Error("署名の取得に失敗しました");
      }

      const signature = await signatureResponse.json();

      // Cloudinaryにアップロード
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature.signature);
      formData.append("timestamp", signature.timestamp.toString());
      formData.append("api_key", signature.apiKey);
      formData.append("public_id", signature.publicId);
      formData.append("folder", signature.folder);
      formData.append(
        "transformation",
        "c_fill,g_face,h_400,w_400,q_auto,f_auto",
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `画像のアップロードに失敗しました (${response.status}): ${errorData}`,
        );
      }

      const result = await response.json();

      // プロフィール画像の状態をすぐに更新（UI に反映）
      setProfileImage(result.secure_url);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "画像のアップロードに失敗しました",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const validateUserId = async (userId: string): Promise<string | null> => {
    if (!userId || userId === user?.userId) {
      return null;
    }

    try {
      const response = await fetch(
        `/api/user/check-id?userId=${encodeURIComponent(userId)}`,
      );
      const result = await response.json();

      if (!response.ok) {
        return "ユーザーIDの確認に失敗しました";
      }

      return result.available ? null : "このユーザーIDは既に使用されています";
    } catch {
      return "ユーザーIDの確認に失敗しました";
    }
  };

  const toggleSkill = (skillId: string) => {
    const newSelected = new Set(selectedSkills);
    if (newSelected.has(skillId)) {
      newSelected.delete(skillId);
    } else {
      newSelected.add(skillId);
    }
    setSelectedSkills(newSelected);
  };

  const toggleOccupation = (occupationId: string) => {
    const newSelected = new Set(selectedOccupations);
    if (newSelected.has(occupationId)) {
      newSelected.delete(occupationId);
    } else {
      newSelected.add(occupationId);
    }
    setSelectedOccupations(newSelected);
  };

  const onSubmit = async (data: ProfileSetupFormData) => {
    console.log("ProfileSetupForm onSubmit - Session:", session?.user?.id);
    console.log("ProfileSetupForm onSubmit - User from props:", user?.id);

    if (!session?.user?.id) {
      console.error("No session user ID found");
      setError("セッション情報が見つかりません。再度ログインしてください。");
      return;
    }

    if (!data.displayName || !data.userId) {
      setError("表示名とユーザーIDは必須です");
      return;
    }

    setIsLoading(true);
    setError(null);

    // ユーザーIDの重複チェック
    const userIdValidationError = await validateUserId(data.userId);
    if (userIdValidationError) {
      setError(userIdValidationError);
      setIsLoading(false);
      return;
    }

    try {
      console.log("Sending profile update request...");

      // APIルート経由でプロフィールを更新
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: data.displayName,
          userId: data.userId,
          bio: data.bio,
          website: data.website,
          location: data.location,
          statusMessage: data.statusMessage,
          skillIds: Array.from(selectedSkills),
          occupationIds: Array.from(selectedOccupations),
          imageUrl: profileImage || undefined,
        }),
      });

      console.log("Profile update response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "プロフィールの更新に失敗しました");
      }

      const result = await response.json();

      if (result.success) {
        // NextAuth セッションを更新（プロフィール画像などの反映のため）
        await update();
        onComplete();
      } else {
        setError(result.error || "プロフィールの更新に失敗しました");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // スキル・職業データをロード
  if (!skillsLoaded) {
    loadSkillsAndOccupations();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* プロフィール画像 */}
        <Card>
          <CardHeader>
            <CardTitle>プロフィール画像</CardTitle>
            <CardDescription>
              あなたを表現する画像をアップロードしてください（任意）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileImage || ""} alt="プロフィール画像" />
                <AvatarFallback>
                  {user?.displayName?.charAt(0) ||
                    form.watch("displayName").charAt(0) ||
                    "？"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? "アップロード中..." : "画像を選択"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG、PNG、WebP対応（最大5MB）
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>表示名とユーザーIDは必須項目です</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>表示名 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="田中 太郎"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    記事や投稿で表示される名前です
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ユーザーID *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="tanaka_taro"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    プロフィールページのURLに使用されます（半角英数字とアンダースコアのみ）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>自己紹介</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="あなたについて簡単に教えてください..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>居住地</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="東京都"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ウェブサイト</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="statusMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ひとこと</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="今取り組んでいることなど..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* スキル選択 */}
        <Card>
          <CardHeader>
            <CardTitle>スキル・技術</CardTitle>
            <CardDescription>
              あなたの得意分野やスキルを選択してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(skills).map(([category, categorySkills]) => (
              <div key={category}>
                <Label className="text-base font-medium mb-3 block">
                  {getCategoryLabel(category)}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant={
                        selectedSkills.has(skill.id) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill.id)}
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 職業選択 */}
        <Card>
          <CardHeader>
            <CardTitle>職業・役割</CardTitle>
            <CardDescription>
              現在の職業や役割を選択してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(occupations).map(
              ([category, categoryOccupations]) => (
                <div key={category}>
                  <Label className="text-base font-medium mb-3 block">
                    {getOccupationCategoryLabel(category)}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {categoryOccupations.map((occupation) => (
                      <Badge
                        key={occupation.id}
                        variant={
                          selectedOccupations.has(occupation.id)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleOccupation(occupation.id)}
                      >
                        {occupation.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ),
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "保存中..." : "Works Logueを始める"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// カテゴリ表示名のヘルパー関数
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    programming: "プログラミング言語",
    framework: "フレームワーク",
    design: "デザイン・UI/UX",
    marketing: "マーケティング",
    business: "ビジネス・マネジメント",
  };
  return labels[category] || category;
}

function getOccupationCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    engineering: "エンジニアリング",
    design: "デザイン",
    business: "ビジネス・企画",
    marketing: "マーケティング・営業",
    management: "マネジメント",
    hr: "人事・組織",
    data: "データ・分析",
    security: "セキュリティ",
    quality: "品質保証",
  };
  return labels[category] || category;
}
