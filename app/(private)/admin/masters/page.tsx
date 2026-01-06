import { Metadata } from "next";
import { AdminMastersPage } from "@/pages";

export const metadata: Metadata = {
  title: "マスタ管理 | Works Logue Admin",
  description: "スキルと職業のマスタデータ管理",
};

export default function Page() {
  return <AdminMastersPage />;
}
