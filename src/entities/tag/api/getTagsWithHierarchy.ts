import { prisma } from "@/shared";
import type { TagNode } from "@/shared";

/**
 * 階層構造を持つタグを取得し、TagNode形式で返す
 * @param _topicId トピックでフィルタリングする場合のトピックID（将来の機能拡張用、現在は未実装）
 */
export async function getTagsWithHierarchy(_topicId?: string): Promise<TagNode[]> {
  const tags = await prisma.tag.findMany({
    include: {
      taxonomyType: {
        select: {
          id: true,
          code: true,
          displayName: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          articles: true,
        },
      },
    },
    orderBy: [
      { taxonomyType: { sortOrder: "asc" } },
      { level: "asc" },
      { sortOrder: "asc" },
    ],
  });

  // 階層構造を構築
  const tagMap = new Map<string, TagNode>();
  const rootTags: TagNode[] = [];

  // 全タグをマップに登録
  tags.forEach((tag) => {
    const tagNode: TagNode = {
      id: tag.id,
      name: tag.name,
      level: tag.level,
      taxonomyType: {
        id: tag.taxonomyType.id,
        code: tag.taxonomyType.code,
        displayName: tag.taxonomyType.displayName,
        sortOrder: tag.taxonomyType.sortOrder,
      },
      description: tag.description,
      parentId: tag.parentId,
      sortOrder: tag.sortOrder,
      children: [],
      _count: {
        articles: tag._count.articles,
      },
    };
    tagMap.set(tag.id, tagNode);
  });

  // 階層関係を構築
  tagMap.forEach((tagNode) => {
    if (tagNode.parentId) {
      const parent = tagMap.get(tagNode.parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(tagNode);
      }
    } else {
      rootTags.push(tagNode);
    }
  });

  return rootTags;
}