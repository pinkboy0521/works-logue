import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Works Logue",
  description: "技術ブログプラットフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Auth0Provider>{children}</Auth0Provider>
      </body>
    </html>
  );
}
