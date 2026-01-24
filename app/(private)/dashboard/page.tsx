import { redirect } from "next/navigation";

export default function Dashboard() {
  // 新しいマイページ構造にリダイレクト
  redirect("/mypage/articles");
}
