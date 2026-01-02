import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ===== 初期化（開発用） =====
  await prisma.post.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ===== Password hash =====
  const passwordHash1 = await bcrypt.hash("password123", 10);
  const passwordHash2 = await bcrypt.hash("password456", 10);

  // ===== User 1 =====
  const user1 = await prisma.user.create({
    data: {
      id: "u_1",
      name: "山田太郎",
      email: "taro@example.com",
      image: "https://picsum.photos/seed/post1/600/400",
    },
  });

  await prisma.account.create({
    data: {
      id: "a_1",
      userId: user1.id,
      type: "credentials",
      provider: "credentials",
      providerAccountId: "taro@example.com",
      access_token: passwordHash1,
    },
  });

  // ===== User 2 =====
  const user2 = await prisma.user.create({
    data: {
      id: "u_2",
      name: "佐藤花子",
      email: "hanako@example.com",
      image: "https://picsum.photos/seed/post2/600/400",
    },
  });

  await prisma.account.create({
    data: {
      id: "a_2",
      userId: user2.id,
      type: "credentials",
      provider: "credentials",
      providerAccountId: "hanako@example.com",
      access_token: passwordHash2,
    },
  });

  // ===== Post =====
  await prisma.post.createMany({
    data: [
      {
        id: "p_1",
        title: "認証設計",
        content: "Credentialsのみで設計",
        userId: user1.id,
      },
      {
        id: "p_2",
        title: "フロント実装",
        content: "ログインフォーム作成",
        userId: user1.id,
      },
      {
        id: "p_3",
        title: "要件整理",
        content: "初期要件まとめ",
        userId: user2.id,
      },
    ],
  });

  console.log("🌱 credentials-only seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
