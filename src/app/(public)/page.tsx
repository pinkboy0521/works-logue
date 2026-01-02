import { Top } from "@/views";

// SSRに切り替えてビルド時のDBアクセスを回避
export const dynamic = "force-dynamic";

export default async function TopPage() {
  return <Top />;
}
