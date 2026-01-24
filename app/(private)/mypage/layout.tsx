"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Button,
  Sheet,
  SheetContent,
  SheetTrigger,
  Menu,
  Settings,
  BookmarkIcon,
  Heart,
  FileText,
} from "@/shared";
import { cn } from "@/shared";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    href: "/mypage/profile",
    label: "プロフィール編集",
    icon: Settings,
  },
  {
    href: "/mypage/articles",
    label: "記事管理",
    icon: FileText,
  },
  {
    href: "/mypage/bookmarks",
    label: "ブックマークした記事",
    icon: BookmarkIcon,
  },
  {
    href: "/mypage/likes",
    label: "いいねした記事",
    icon: Heart,
  },
];

function NavItems({
  currentPath,
  onItemClick,
}: {
  currentPath: string;
  onItemClick?: () => void;
}) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname() || "/mypage";

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* モバイルヘッダー */}
      <div className="flex items-center justify-between mb-6 md:hidden">
        <h1 className="text-2xl font-bold">マイページ</h1>
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="py-4">
              <h2 className="text-lg font-semibold mb-4">メニュー</h2>
              <NavItems
                currentPath={pathname}
                onItemClick={() => setSidebarOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-8">
        {/* デスクトップサイドバー */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-4">
            <h2 className="text-lg font-semibold mb-4">メニュー</h2>
            <NavItems currentPath={pathname} />
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 min-w-0">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">読み込み中...</div>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
