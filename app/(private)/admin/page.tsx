import { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from "@/shared";

export const metadata: Metadata = {
  title: "管理者ダッシュボード | Works Logue",
  description: "Works Logueの管理者機能",
};

export default function AdminPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>マスタ管理</CardTitle>
          <CardDescription>
            スキルと職業のマスタデータを管理します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/admin/masters">マスタ管理画面へ</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ユーザー管理</CardTitle>
          <CardDescription>
            登録ユーザーの管理と統計情報を確認します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>
            準備中
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>記事管理</CardTitle>
          <CardDescription>
            投稿された記事の管理とモデレーションを行います
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>
            準備中
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>システム設定</CardTitle>
          <CardDescription>
            システム全体の設定とメンテナンス機能です
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>
            準備中
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
