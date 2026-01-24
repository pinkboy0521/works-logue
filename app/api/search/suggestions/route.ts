import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({
        topics: [],
        tags: [],
        users: [],
      });
    }

    // 並列でトピック、タグ、ユーザーを検索
    const [topics, tags, users] = await Promise.all([
      // トピック検索（部分一致、3件まで）
      prisma.topic.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        include: {
          _count: {
            select: {
              articles: {
                where: {
                  status: "PUBLISHED",
                },
              },
            },
          },
        },
        orderBy: {
          articles: {
            _count: "desc", // 記事数の多い順
          },
        },
        take: 3,
      }),

      // タグ検索（1階層のみ、部分一致、3件まで）
      prisma.tag.findMany({
        where: {
          AND: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              level: 1, // 1階層のみ
            },
          ],
        },
        include: {
          _count: {
            select: {
              articles: true,
            },
          },
          taxonomyType: {
            select: {
              displayName: true,
            },
          },
        },
        orderBy: {
          articles: {
            _count: "desc", // 記事数の多い順
          },
        },
        take: 3,
      }),

      // ユーザー検索（ユーザーID、表示名で検索、3件まで）
      prisma.user.findMany({
        where: {
          OR: [
            {
              userId: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              displayName: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          userId: true,
          displayName: true,
          image: true,
          _count: {
            select: {
              articles: {
                where: {
                  status: "PUBLISHED",
                },
              },
            },
          },
        },
        orderBy: {
          articles: {
            _count: "desc", // 記事数の多い順
          },
        },
        take: 3,
      }),
    ]);

    return NextResponse.json({
      topics: topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
        description: topic.description,
        _count: topic._count,
      })),
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        level: tag.level,
        taxonomyType: tag.taxonomyType.displayName,
        _count: tag._count,
      })),
      users: users.map((user) => ({
        userId: user.userId,
        displayName: user.displayName,
        profileImageUrl: user.image,
        _count: user._count,
      })),
    });
  } catch (error) {
    console.error("検索候補取得エラー:", error);
    return NextResponse.json(
      { error: "検索候補の取得に失敗しました" },
      { status: 500 },
    );
  }
}
