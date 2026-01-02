import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
  );
}
