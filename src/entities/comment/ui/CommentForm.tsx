"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Textarea,
} from "@/shared";
import { createComment } from "../api";
import { createCommentSchema, type CreateCommentForm } from "../lib/validation";

interface CommentFormProps {
  articleId: string;
  parentId?: string;
  placeholder?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onOptimisticAdd?: (content: string, parentId?: string) => void;
  compact?: boolean;
}

export function CommentForm({
  articleId,
  parentId,
  placeholder = "コメントを入力...",
  onSuccess,
  onCancel,
  onOptimisticAdd,
  compact = false,
}: CommentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateCommentForm>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: "",
      articleId,
      parentId,
    },
  });

  const handleSubmit = (data: CreateCommentForm) => {
    setError(null);

    startTransition(async () => {
      try {
        // Optimistic add - startTransition内で実行
        onOptimisticAdd?.(data.content, parentId);

        const result = await createComment(data);

        if (result.success) {
          form.reset();
          onSuccess?.();
        } else {
          setError(result.error || "コメントの投稿に失敗しました");
          // エラーの場合はページをリロードして一時的なコメントを削除
          window.location.reload();
        }
      } catch {
        setError("コメントの投稿に失敗しました");
        // エラーの場合はページをリロードして一時的なコメントを削除
        window.location.reload();
      }
    });
  };

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder={placeholder}
                    className={compact ? "min-h-[80px]" : "min-h-[100px]"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={isPending || !form.watch("content").trim()}
              size={compact ? "sm" : "default"}
            >
              {isPending ? "投稿中..." : parentId ? "返信" : "コメント"}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size={compact ? "sm" : "default"}
                onClick={onCancel}
                disabled={isPending}
              >
                キャンセル
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
