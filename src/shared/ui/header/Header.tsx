import { auth } from "@/auth";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  ShrimpIcon,
} from "@/shared";
import Link from "next/link";
import { HeaderMenu } from "./HeaderMenu";

export async function Header() {
  const session = await auth();

  return (
    <header className="bg-background border-b shadow-md flex items-center h-16">
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
        <HeaderMenu session={session} />
      </div>
    </header>
  );
}
