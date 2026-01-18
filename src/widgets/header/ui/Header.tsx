import { auth } from "@/auth";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  ShrimpIcon,
  Button,
} from "@/shared";
import Link from "next/link";
import { HeaderMenu } from "./HeaderMenu";
import { SearchBar } from "./SearchBar";
import { createNewArticleAction } from "@/features";

export async function Header() {
  const session = await auth();

  return (
    <header className="bg-background border-b shadow-md flex items-center h-16 sticky top-0 z-50">
      <div className="px-xxl flex items-center justify-between w-full">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href={"/"} className="heading-1 flex items-center gap-s">
                <ShrimpIcon className="w-8 h-8 text-primary" />
                Works Logue
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* 検索窓を中央に配置 */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-4">
          <HeaderMenu session={session} />
          {session && (
            <form action={createNewArticleAction}>
              <Button
                type="submit"
                variant="default"
                className="cursor-pointer"
              >
                投稿する
              </Button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
