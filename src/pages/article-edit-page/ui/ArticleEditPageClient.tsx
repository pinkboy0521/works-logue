"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@/shared";
import { updateArticle, getAllTopics, DraftArticle } from "@/entities";
import {
  validateDraftArticle,
  validatePublishArticle,
  extractValidationErrors,
  type ValidationErrors,
} from "@/features";

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
    content: article.content || "",
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

  const handleSaveDraft = async () => {
    clearErrors();

    // 下書き保存のバリデーション（トピックのみ必須）
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
      // エラーは遷移先で適切に処理する
    }
  };

  const handlePublish = async () => {
    clearErrors();

    // 公開のバリデーション（全項目必須）
    const validationResult = validatePublishArticle({
      ...formData,
      status: "PUBLISHED",
    });

    if (!validationResult.success) {
      const fieldErrors = extractValidationErrors(validationResult);
      setErrors(fieldErrors);
      return;
    }

    // バリデーション成功時のみ処理を続行
    try {
      const updatedArticle = await updateArticle(article.id, userId, {
        ...formData,
        status: "PUBLISHED",
      });
      // 公開完了後に記事ページに遷移
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
        {/* Title Input */}
        <div>
          {/* グローバルエラー表示 */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
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

        {/* Editor Layout - Split View */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-300px)]">
            {/* Markdown Editor */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
                編集
              </h2>
              <textarea
                placeholder="Markdownで記事を書いてください..."
                value={formData.content}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, content: e.target.value }));
                  if (errors.content) clearFieldError("content");
                }}
                className={`w-full h-full resize-none border-none outline-none bg-transparent text-foreground placeholder:text-muted-foreground ${
                  errors.content ? "border-destructive" : ""
                }`}
              />
            </Card>

            {/* Preview */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
                プレビュー
              </h2>
              <div className="h-full overflow-auto prose prose-sm max-w-none">
                {formData.content ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formData.content
                        .replace(/\n/g, "<br>")
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em>$1</em>")
                        .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
                        .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
                        .replace(/^### (.*?)$/gm, "<h3>$1</h3>"),
                    }}
                  />
                ) : (
                  <p className="text-muted-foreground italic">
                    ここにプレビューが表示されます
                  </p>
                )}
              </div>
            </Card>
          </div>
          {errors.content && (
            <p className="text-destructive text-sm mt-1">{errors.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
