import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/shared";
import Link from "next/link";
export async function PrivateHeader() {
  return (
    <header className="bg-background border-b shadow-md flex items-center h-16">
      <div className="container mx-auto px-l flex items-center justify-between">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/dashboard">
                <NavigationMenuLink className="heading-3">
                  管理ページ
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
