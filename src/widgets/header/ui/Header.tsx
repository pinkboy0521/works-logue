import { auth } from "@/auth";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  ShrimpIcon,
  Button,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/shared";
import { Search } from "lucide-react";
import Link from "next/link";
import { HeaderMenu } from "./HeaderMenu";
import { SearchBar } from "./SearchBar";
import { createNewArticleAction } from "@/features";

export async function Header() {
  const session = await auth();

  return (
    <header className="bg-background border-b shadow-md flex items-center h-16 sticky top-0 z-50">
      <div className="px-4 md:px-8 flex items-center justify-between w-full">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href={"/"} className="heading-1 flex items-center gap-2">
                <ShrimpIcon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                <span className="text-lg md:text-xl font-bold">Works Logue</span>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* デスクトップ検索窓 */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <SearchBar />
        </div>

        {/* モバイル検索ボタン */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-24">
              <div className="p-4">
                <SearchBar />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <HeaderMenu session={session} />
          {session && (
            <form action={createNewArticleAction}>
              <Button
                type="submit"
                variant="default"
                size="sm"
                className="cursor-pointer hidden sm:inline-flex"
              >
                投稿する
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                className="cursor-pointer sm:hidden"
              >
                +
              </Button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
