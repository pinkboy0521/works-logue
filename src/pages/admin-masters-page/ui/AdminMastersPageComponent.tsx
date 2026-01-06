"use client";

import { useState, useEffect } from "react";
import {
  getAllSkills,
  getAllOccupations,
  createSkill,
  updateSkill,
  deleteSkill,
  createOccupation,
  updateOccupation,
  deleteOccupation,
  type Skill,
  type Occupation,
  type SkillFormData,
  type OccupationFormData,
  skillFormSchema,
  occupationFormSchema,
  SKILL_CATEGORY_OPTIONS,
  OCCUPATION_CATEGORY_OPTIONS,
} from "@/features/admin-management";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Badge,
  Label,
} from "@/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function AdminMastersPageComponent() {
  const [skills, setSkills] = useState<Record<string, Skill[]>>({});
  const [occupations, setOccupations] = useState<Record<string, Occupation[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showOccupationForm, setShowOccupationForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingOccupation, setEditingOccupation] = useState<Occupation | null>(
    null,
  );

  const skillForm = useForm<SkillFormData>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
    },
  });

  const occupationForm = useForm<OccupationFormData>({
    resolver: zodResolver(occupationFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
    },
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [skillsData, occupationsData] = await Promise.all([
        getAllSkills(),
        getAllOccupations(),
      ]);
      setSkills(skillsData);
      setOccupations(occupationsData);
    } catch {
      setError("データの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSkill = async (data: SkillFormData) => {
    const result = await createSkill(data);
    if (result.success) {
      skillForm.reset();
      setShowSkillForm(false);
      loadData();
    } else {
      setError(result.error || "スキルの作成に失敗しました");
    }
  };

  const handleUpdateSkill = async (data: SkillFormData) => {
    if (!editingSkill) return;

    const result = await updateSkill(editingSkill.id, data);
    if (result.success) {
      skillForm.reset();
      setEditingSkill(null);
      setShowSkillForm(false);
      loadData();
    } else {
      setError(result.error || "スキルの更新に失敗しました");
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm("このスキルを削除しますか？")) return;

    const result = await deleteSkill(skillId);
    if (result.success) {
      loadData();
    } else {
      setError(result.error || "スキルの削除に失敗しました");
    }
  };

  const handleCreateOccupation = async (data: OccupationFormData) => {
    const result = await createOccupation(data);
    if (result.success) {
      occupationForm.reset();
      setShowOccupationForm(false);
      loadData();
    } else {
      setError(result.error || "職業の作成に失敗しました");
    }
  };

  const handleUpdateOccupation = async (data: OccupationFormData) => {
    if (!editingOccupation) return;

    const result = await updateOccupation(editingOccupation.id, data);
    if (result.success) {
      occupationForm.reset();
      setEditingOccupation(null);
      setShowOccupationForm(false);
      loadData();
    } else {
      setError(result.error || "職業の更新に失敗しました");
    }
  };

  const handleDeleteOccupation = async (occupationId: string) => {
    if (!confirm("この職業を削除しますか？")) return;

    const result = await deleteOccupation(occupationId);
    if (result.success) {
      loadData();
    } else {
      setError(result.error || "職業の削除に失敗しました");
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    skillForm.reset({
      name: skill.name,
      description: skill.description || "",
      categoryId: skill.categoryId,
    });
    setShowSkillForm(true);
  };

  const handleEditOccupation = (occupation: Occupation) => {
    setEditingOccupation(occupation);
    occupationForm.reset({
      name: occupation.name,
      description: occupation.description || "",
      categoryId: occupation.categoryId,
    });
    setShowOccupationForm(true);
  };

  const cancelSkillForm = () => {
    setShowSkillForm(false);
    setEditingSkill(null);
    skillForm.reset();
  };

  const cancelOccupationForm = () => {
    setShowOccupationForm(false);
    setEditingOccupation(null);
    occupationForm.reset();
  };

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive">
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setError(null)}
            className="ml-2"
          >
            閉じる
          </Button>
        </Alert>
      )}

      {/* スキル管理 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>スキル管理</CardTitle>
              <CardDescription>
                ユーザーが選択できるスキルを管理します
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowSkillForm(true)}
              disabled={showSkillForm}
            >
              新しいスキルを追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showSkillForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingSkill ? "スキルを編集" : "新しいスキルを追加"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...skillForm}>
                  <form
                    onSubmit={skillForm.handleSubmit(
                      editingSkill ? handleUpdateSkill : handleCreateSkill,
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={skillForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>スキル名 *</FormLabel>
                          <FormControl>
                            <Input placeholder="例: JavaScript" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={skillForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>説明</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="例: Webアプリケーション開発の基本言語"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={skillForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>カテゴリ *</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="">選択してください</option>
                              {SKILL_CATEGORY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="submit">
                        {editingSkill ? "更新" : "作成"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelSkillForm}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {Object.entries(skills).map(([category, categorySkills]) => (
            <div key={category}>
              <Label className="text-base font-medium mb-3 block">
                {SKILL_CATEGORY_OPTIONS.find((opt) => opt.value === category)
                  ?.label || category}
              </Label>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <div key={skill.id} className="group relative">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleEditSkill(skill)}
                    >
                      {skill.name}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSkill(skill.id);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 職業管理 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>職業管理</CardTitle>
              <CardDescription>
                ユーザーが選択できる職業を管理します
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowOccupationForm(true)}
              disabled={showOccupationForm}
            >
              新しい職業を追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showOccupationForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingOccupation ? "職業を編集" : "新しい職業を追加"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...occupationForm}>
                  <form
                    onSubmit={occupationForm.handleSubmit(
                      editingOccupation
                        ? handleUpdateOccupation
                        : handleCreateOccupation,
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={occupationForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>職業名 *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="例: フロントエンドエンジニア"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={occupationForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>説明</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="例: WebアプリケーションのUI/UX実装"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={occupationForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>カテゴリ *</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="">選択してください</option>
                              {OCCUPATION_CATEGORY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="submit">
                        {editingOccupation ? "更新" : "作成"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelOccupationForm}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {Object.entries(occupations).map(
            ([category, categoryOccupations]) => (
              <div key={category}>
                <Label className="text-base font-medium mb-3 block">
                  {OCCUPATION_CATEGORY_OPTIONS.find(
                    (opt) => opt.value === category,
                  )?.label || category}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {categoryOccupations.map((occupation) => (
                    <div key={occupation.id} className="group relative">
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => handleEditOccupation(occupation)}
                      >
                        {occupation.name}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOccupation(occupation.id);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </CardContent>
      </Card>
    </div>
  );
}
