"use client";

import { useState, useRef, useEffect } from "react";
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
  toast,
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
  mode?: "setup" | "edit"; // 編集モード判定用
  onPreviewUpdate?: (updatedUser: UserWithProfile) => void; // プレビュー更新用
}

export function ProfileSetupForm({
  user,
  onComplete,
  mode = "setup",
  onPreviewUpdate,
}: ProfileSetupFormProps) {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 現在のプロフィール画像（DB上の値）
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.image || null,
  );

  // フローA用の状態
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null); // Object URL
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // アップロード済みURL
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [hasChanges, setHasChanges] = useState(false); // フォーム変更検知
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

  // 編集モードの場合はユーザーIDの変更を禁止
  const isExistingUser = mode === "edit" || !!user?.userId;

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
        setSelectedSkills(
          new Set(
            user.userSkills.map((us: { skill: { id: string } }) => us.skill.id),
          ),
        );
      }
      if (user?.userOccupations) {
        setSelectedOccupations(
          new Set(
            user.userOccupations.map(
              (uo: { occupation: { id: string } }) => uo.occupation.id,
            ),
          ),
        );
      }

      setSkillsLoaded(true);
    } catch (error) {
      console.error("Failed to load skills/occupations:", error);
    }
  };

  // フォームの変更をリアルタイムでプレビューに反映
  const formValues = form.watch();

  // 初回のプレビュー設定（マウント時に1回のみ）
  useEffect(() => {
    if (onPreviewUpdate && user) {
      onPreviewUpdate(user);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // フォーム変更の監視（値の変更時のみ、最低限の依存関係）
  useEffect(() => {
    if (!onPreviewUpdate || !user) return;

    // 画像の優先順位: ローカルプレビュー > アップロード済み > 現在のプロフィール画像
    const currentImageUrl =
      localPreviewUrl || uploadedImageUrl || profileImage || user.image;

    // 選択されたスキルの詳細情報を取得
    const userSkillsData = Array.from(selectedSkills).map((skillId) => {
      // skillsデータから該当スキルを検索
      for (const categorySkills of Object.values(skills)) {
        const skill = categorySkills.find((s) => s.id === skillId);
        if (skill) {
          return {
            skill: {
              id: skill.id,
              name: skill.name,
              description: skill.description,
              categoryId: skill.categoryId,
              createdAt: skill.createdAt,
              updatedAt: skill.updatedAt,
            },
          };
        }
      }
      // 見つからない場合はデフォルト値
      return {
        skill: {
          id: skillId,
          name: "",
          description: null,
          categoryId: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
    });

    // 選択された職業の詳細情報を取得
    const userOccupationsData = Array.from(selectedOccupations).map(
      (occupationId) => {
        // occupationsデータから該当職業を検索
        for (const categoryOccupations of Object.values(occupations)) {
          const occupation = categoryOccupations.find(
            (o) => o.id === occupationId,
          );
          if (occupation) {
            return {
              occupation: {
                id: occupation.id,
                name: occupation.name,
                description: occupation.description,
                categoryId: occupation.categoryId,
                createdAt: occupation.createdAt,
                updatedAt: occupation.updatedAt,
              },
            };
          }
        }
        // 見つからない場合はデフォルト値
        return {
          occupation: {
            id: occupationId,
            name: "",
            description: null,
            categoryId: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
      },
    );

    const updatedUser: UserWithProfile = {
      ...user,
      displayName: formValues.displayName || user.displayName,
      userId: formValues.userId || user.userId,
      bio: formValues.bio || user.bio,
      website: formValues.website || user.website,
      location: formValues.location || user.location,
      statusMessage: formValues.statusMessage || user.statusMessage,
      image: currentImageUrl,
      // スキル・職業は選択されたもので更新（実際のデータ使用）
      userSkills: userSkillsData,
      userOccupations: userOccupationsData,
    };

    onPreviewUpdate(updatedUser);
  }, [
    formValues.displayName,
    formValues.userId,
    formValues.bio,
    formValues.website,
    formValues.location,
    formValues.statusMessage,
    selectedSkills,
    selectedOccupations,
    skills, // スキルデータも依存関係に追加
    occupations, // 職業データも依存関係に追加
    profileImage,
    localPreviewUrl,
    uploadedImageUrl,
  ]);

  // フォームデータの変更を監視
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (!user) {
        setHasChanges(true);
        return;
      }

      // 各フィールドの変更をチェック
      const fieldsChanged =
        data.displayName !== user.displayName ||
        data.userId !== user.userId ||
        data.bio !== user.bio ||
        data.website !== user.website ||
        data.location !== user.location ||
        data.statusMessage !== user.statusMessage;

      // スキル・職業の変更をチェック
      const currentSkills = Array.from(selectedSkills);
      const originalSkills = user.userSkills?.map((us) => us.skill.id) || [];
      const skillsChanged =
        currentSkills.length !== originalSkills.length ||
        !currentSkills.every((id) => originalSkills.includes(id));

      const currentOccupations = Array.from(selectedOccupations);
      const originalOccupations =
        user.userOccupations?.map((uo) => uo.occupation.id) || [];
      const occupationsChanged =
        currentOccupations.length !== originalOccupations.length ||
        !currentOccupations.every((id) => originalOccupations.includes(id));

      // 画像の変更をチェック
      const imageChanged = uploadedImageUrl !== null;

      setHasChanges(
        fieldsChanged || skillsChanged || occupationsChanged || imageChanged,
      );
    });

    return () => subscription.unsubscribe();
  }, [
    form,
    user,
    selectedSkills,
    selectedOccupations,
    uploadedImageUrl,
    localPreviewUrl,
    onPreviewUpdate,
  ]);

  // フローA：画像選択 → ローカルプレビュー + 裏アップロード → 保存で確定
  const handleImageUpload = async (file: File) => {
    if (!session?.user?.id) {
      setError("セッションが見つかりません。再度ログインしてください。");
      return;
    }

    // 即座にローカルプレビューを表示
    const previewUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(previewUrl);

    // 裏でアップロード開始
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

      // アップロード完了：URLを保存（まだDB更新しない）
      setUploadedImageUrl(result.secure_url);

      // 変更検知を更新
      setHasChanges(true);

      // プレビュー更新は既存のuseEffectが自動で行う
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

    // スキル変更時のプレビュー更新
    if (onPreviewUpdate && user && skills && Object.keys(skills).length > 0) {
      const allSkills = Object.values(skills).flat();
      const selectedSkillObjects = allSkills
        .filter((skill) => newSelected.has(skill.id))
        .map((skill) => ({ skill }));

      const updatedUser: UserWithProfile = {
        ...user,
        userSkills: selectedSkillObjects,
      };
      onPreviewUpdate(updatedUser);
    }
  };

  const toggleOccupation = (occupationId: string) => {
    const newSelected = new Set(selectedOccupations);
    if (newSelected.has(occupationId)) {
      newSelected.delete(occupationId);
    } else {
      newSelected.add(occupationId);
    }
    setSelectedOccupations(newSelected);

    // 職業変更時のプレビュー更新
    if (
      onPreviewUpdate &&
      user &&
      occupations &&
      Object.keys(occupations).length > 0
    ) {
      const allOccupations = Object.values(occupations).flat();
      const selectedOccupationObjects = allOccupations
        .filter((occupation) => newSelected.has(occupation.id))
        .map((occupation) => ({ occupation }));

      const updatedUser: UserWithProfile = {
        ...user,
        userOccupations: selectedOccupationObjects,
      };
      onPreviewUpdate(updatedUser);
    }
  };

  const onSubmit = async (data: ProfileSetupFormData) => {
    console.log("ProfileSetupForm onSubmit called - mode:", mode);
    console.log("ProfileSetupForm onSubmit - Session:", session?.user?.id);
    console.log("ProfileSetupForm onSubmit - User from props:", user?.id);
    console.log("ProfileSetupForm onSubmit - Data:", data);

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

      // フローA：アップロード済み画像URLを確定、または削除状態を反映
      let finalImageUrl: string | null | undefined = profileImage; // デフォルトは現在の値

      if (uploadedImageUrl) {
        // 新しい画像がアップロードされている場合
        finalImageUrl = uploadedImageUrl;
      } else if (localPreviewUrl === null && uploadedImageUrl === null) {
        // 画像削除が選択されている場合
        finalImageUrl = null;
      }

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
          imageUrl: finalImageUrl,
        }),
      });

      console.log("Profile update response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "プロフィールの更新に失敗しました");
      }

      const result = await response.json();

      if (result.success) {
        // フローA：保存完了後の状態更新
        if (finalImageUrl !== undefined) {
          setProfileImage(finalImageUrl);
        }

        // 一時的な状態をリセット
        setLocalPreviewUrl(null);
        setUploadedImageUrl(null);
        setHasChanges(false);

        // NextAuth セッションを更新（プロフィール画像などの反映のため）
        await update();

        // ヘッダーメニューにプロフィール画像更新を通知
        if (finalImageUrl !== undefined) {
          const profileUpdateEvent = new CustomEvent("profileImageUpdate", {
            detail: { imageUrl: finalImageUrl },
          });
          window.dispatchEvent(profileUpdateEvent);
        }

        // 成功メッセージをtoastで表示
        toast.success("プロフィールを更新しました");

        // プレビュー更新は保存後のuseEffectが自動で行う

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

        {/* フローA：上部に保存ボタンを配置 */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || !hasChanges}
            className="min-w-24"
          >
            {isLoading ? "更新中..." : "更新する"}
          </Button>
        </div>

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
                {/* フローA：ローカルプレビュー優先、なければ現在のプロフィール画像 */}
                {localPreviewUrl || uploadedImageUrl || profileImage ? (
                  <AvatarImage
                    src={
                      localPreviewUrl || uploadedImageUrl || profileImage || ""
                    }
                    alt="プロフィール画像"
                  />
                ) : null}
                <AvatarFallback className="text-lg font-semibold">
                  {form.watch("displayName").charAt(0)?.toUpperCase() ||
                    user?.displayName?.charAt(0)?.toUpperCase() ||
                    user?.userId?.charAt(0)?.toUpperCase() ||
                    "ユ"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                {/* アップロード状態表示 */}
                {isUploadingImage && (
                  <div className="text-sm text-gray-600">
                    画像をアップロード中...
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? "アップロード中..." : "画像を選択"}
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
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
                      disabled={isLoading || isExistingUser}
                    />
                  </FormControl>
                  <FormDescription>
                    {isExistingUser
                      ? "ユーザーIDは登録後は変更できません"
                      : "プロフィールページのURLに使用されます（半角英数字とアンダースコアのみ）"}
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
