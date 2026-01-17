"use client";

import { useRouter } from "next/navigation";
import { User, UserPlus, X } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/shared";

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginPrompt({ isOpen, onClose }: LoginPromptProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-center">
            コメント機能を使用するには
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            コメントを投稿したり、他のユーザーと交流するにはアカウントが必要です。
          </p>

          <div className="space-y-3">
            <Button onClick={handleLogin} className="w-full" variant="default">
              <User className="h-4 w-4 mr-2" />
              ログイン
            </Button>

            <Button onClick={handleSignup} className="w-full" variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              新規登録
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground"
            >
              あとで登録する
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
