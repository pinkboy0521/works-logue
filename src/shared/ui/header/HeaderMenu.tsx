import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  logoutAction,
} from "@/shared";
import { Session } from "next-auth";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function HeaderMenu({ session }: { session: Session | null }) {
  return (
    <div className="flex items-center gap-s">
      <ThemeToggle />
      {session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer w-12 h-12">
              <AvatarImage src={session.user?.image || ""} />
              <AvatarFallback>
                {session.user?.name?.slice(0, 1) || ""}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuItem
              onClick={logoutAction}
              className="w-full cursor-pointer"
            >
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button variant="ghost" asChild>
            <Link href="/login">ログイン</Link>
          </Button>
          <Button asChild>
            <Link href="/login">新規登録</Link>
          </Button>
        </>
      )}
    </div>
  );
}
