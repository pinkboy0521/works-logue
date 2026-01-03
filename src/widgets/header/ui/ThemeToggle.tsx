"use client";

import { Button, MoonIcon, SunIcon, useTheme } from "@/shared";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // マウント前は何も表示しない（ハイドレーションエラーを防ぐため）
  if (!mounted) {
    return <div className="w-12 h-12" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="cursor-pointer rounded-full w-8 h-8"
    >
      {theme === "dark" ? <MoonIcon /> : <SunIcon />}
      <span className="sr-only">
        {theme === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      </span>
    </Button>
  );
}
