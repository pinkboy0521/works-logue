"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function LoginModal({
  isOpen,
  onClose,
  title,
  message,
}: LoginModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    router.push("/login");
  };

  const handleSignup = () => {
    onClose();
    router.push("/signup");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-muted-foreground text-sm">{message}</p>
          </div>

          <div className="space-y-3">
            <Button onClick={handleLogin} className="w-full" variant="default">
              ログイン
            </Button>
            <Button onClick={handleSignup} className="w-full" variant="outline">
              新規登録
            </Button>
          </div>

          <div className="pt-2">
            <Button
              onClick={onClose}
              className="w-full"
              variant="ghost"
              size="sm"
            >
              キャンセル
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
