"use client";

import { Button } from "@/shared";

export function LoginForm() {
  // const [errorMessage, formAction, isPending] = useActionState(
  //   authenticate,
  //   undefined
  // );
  return (
    <div className="space-y-m">
      <div>LoginForm</div>
      <Button>ログイン</Button>
    </div>
  );
}
