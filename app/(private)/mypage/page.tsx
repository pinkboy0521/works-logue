import { redirect } from "next/navigation";

export default function MyPageIndex() {
  // デフォルトで記事管理ページにリダイレクト
  redirect("/mypage/articles");
}
