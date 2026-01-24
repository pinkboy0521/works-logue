"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button, Input, Card } from "@/shared";
import { updateArticle, getAllTopics, DraftArticle } from "@/entities";
import { Block } from "@blocknote/core";
import {
  validateDraftArticle,
  validatePublishArticle,
  extractValidationErrors,
  type ValidationErrors,
} from "@/features";

// BlockNoteEditorを動的インポートでSSRを無効化
const BlockNoteEditor = dynamic(
  () => import("@/features").then((mod) => ({ default: mod.BlockNoteEditor })),
  {
    ssr: false,
    loading: () => (
      <Card className="p-4">
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
          <div className="h-64 bg-muted rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      </Card>
    ),
  },
);

interface ArticleEditPageClientProps {
  article: DraftArticle;
  topics: Awaited<ReturnType<typeof getAllTopics>>;
  userId: string;
}

export function ArticleEditPageClient({
  article,
  topics,
  userId,
}: ArticleEditPageClientProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    title: article.title || "",
    content:
      Array.isArray(article.content) && article.content.length > 0
        ? (article.content as Block[])
        : [
            {
              type: "paragraph",
              content: [{ type: "text", text: "", styles: {} }],
            } as Block,
          ],
    topicId: article.topicId || "",
    status: article.status,
  });

  const clearFieldError = (fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const clearErrors = () => setErrors({});

  // BlockNoteエディターの内容変更処理
  const handleContentChange = useCallback(
    (blocks: Block[]) => {
      setFormData((prev) => ({ ...prev, content: blocks }));
      if (errors.content) clearFieldError("content");
    },
    [errors.content],
  );

  const handleSaveDraft = async () => {
    clearErrors();

    // 下書き保存のバリデーション
    const validationResult = validateDraftArticle({
      ...formData,
      status: "DRAFT",
    });

    if (!validationResult.success) {
      const fieldErrors = extractValidationErrors(validationResult);
      setErrors(fieldErrors);
      return;
    }

    // すぐにダッシュボードに遷移
    router.push("/dashboard");

    // バックグラウンドで保存処理
    try {
      await updateArticle(article.id, userId, {
        ...formData,
        status: "DRAFT",
      });
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const handlePublish = async () => {
    clearErrors();

    // 公開のバリデーション
    const validationResult = validatePublishArticle({
      ...formData,
      status: "PUBLISHED",
    });

    if (!validationResult.success) {
      const fieldErrors = extractValidationErrors(validationResult);
      setErrors(fieldErrors);
      return;
    }

    try {
      const updatedArticle = await updateArticle(article.id, userId, {
        ...formData,
        status: "PUBLISHED",
      });
      router.push(`/${updatedArticle.user.id}/articles/${updatedArticle.id}`);
    } catch (error) {
      console.error("Error publishing article:", error);
      setErrors({ submit: "公開に失敗しました。もう一度お試しください。" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6 p-4 bg-card border-b border-border">
        <h1 className="text-xl font-semibold text-card-foreground">
          記事を編集
        </h1>
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            className="cursor-pointer"
          >
            下書きを保存
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            className="cursor-pointer"
          >
            {article.status === "PUBLISHED" ? "更新" : "公開"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Global Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <h3 className="text-sm font-medium text-destructive mb-2">
              入力エラー
            </h3>
            <ul className="text-sm text-destructive space-y-1">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>• {message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Title Input */}
        <div>
          <Input
            placeholder="記事のタイトル"
            value={formData.title}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, title: e.target.value }));
              if (errors.title) clearFieldError("title");
            }}
            className={`text-2xl font-bold border-none p-0 focus:ring-0 ${
              errors.title ? "border-destructive focus:border-destructive" : ""
            }`}
          />
          {errors.title && (
            <p className="text-destructive text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Topic Selection */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            トピック
          </label>
          <select
            value={formData.topicId}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, topicId: e.target.value }));
              if (errors.topicId) clearFieldError("topicId");
            }}
            className={`w-full p-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
              errors.topicId ? "border-destructive focus:ring-destructive" : ""
            }`}
          >
            <option value="">トピックを選択してください</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
          {errors.topicId && (
            <p className="text-destructive text-sm mt-1">{errors.topicId}</p>
          )}
        </div>

        {/* BlockNote Editor */}
        <div className="space-y-2">
          <Card >            
            <div className="min-h-[400px]">
              <BlockNoteEditor
                initialContent={formData.content}
                onChange={handleContentChange}
                className="w-full"
              />
            </div>
          </Card>
          {errors.content && (
            <p className="text-destructive text-sm mt-1">{errors.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
