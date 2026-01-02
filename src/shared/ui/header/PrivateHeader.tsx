import { auth } from "@/auth";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  ShrimpIcon,
} from "@/shared";
import Link from "next/link";
import Setting from "./Setting";

export async function PrivateHeader() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("不正なリクエストです");

  return (
    <header className="bg-background border-b shadow-md flex items-center h-16">
      <div className="container mx-auto px-xxl flex items-center justify-between">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link
                href="/dashboard"
                className="heading-1 flex items-center gap-s"
              >
                <ShrimpIcon className="w-8 h-8 text-primary" />
                Works Logue
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Setting session={session} />
      </div>
    </header>
  );
}
