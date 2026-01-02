"use client";

import {
  authenticate,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/shared";
import { useActionState } from "react";

export function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>ログイン</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-m">
          <div className="space-y-xs">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" name="email" required />
          </div>
          <div className="space-y-xs">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" type="password" name="password" required />
          </div>
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isPending}
          >
            ログイン
          </Button>
          <div className="flex items-end space-x-m">
            {errorMessage && (
              <p className="label-m text-destructive">{errorMessage}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
