import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  logoutAction,
} from "@/shared";
import { Session } from "next-auth";

export default function Setting({ session }: { session: Session }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">{session.user?.name}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        <form action={logoutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full text-left cursor-pointer">
              ログアウト
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
