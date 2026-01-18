import { searchArticles, getTagsWithHierarchy, getAllTopics } from "@/entities";
import { SearchPage } from "@/pages";
import { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    topic?: string;
    tags?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const { q = "", topic } = params;
  
  let title = "記事探索 - Works Logue";
  let description = "興味のある記事を検索・探索して見つけよう";
  
  if (q.trim()) {
    title = `「${q}」の検索結果 - Works Logue`;
    description = `「${q}」に関連する記事を探す`;
  } else if (topic) {
    // トピック名は取得が重いので、ここではシンプルに
    title = "トピック別記事探索 - Works Logue";
    description = "選択されたトピックに関する記事を探索する";
  }
    
  return {
    title,
    description,
  };
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    topic?: string;
    tags?: string;
    page?: string;
  }>;
}

export default async function Page({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const { q = "", topic, tags, page = "1" } = params;
  

  // URLパラメータから検索条件を構築
  const searchQuery = q.trim();
  const topicId = topic || undefined;
  const tagIds = tags ? tags.split(",").filter(Boolean) : undefined;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  try {
    // 検索実行、タグ、トピック取得を並列実行
    const [searchResult, allTags, allTopics] = await Promise.all([
      searchArticles({
        query: searchQuery,
        topicId,
        tagIds,
        page: currentPage,
        limit: 12,
      }),
      getTagsWithHierarchy(topicId), // トピックでフィルタリング
      getAllTopics(),
    ]);

    return (
      <SearchPage
        searchResult={searchResult}
        tagGroups={{ tags: allTags }}
        allTopics={allTopics}
        selectedTopicId={topicId}
      />
    );
  } catch (error) {
    console.error("検索エラー:", error);
    
    // エラー時は空の結果を返す
    const [allTags, allTopics] = await Promise.all([
      getTagsWithHierarchy(topicId).catch(() => []), // トピックでフィルタリング
      getAllTopics().catch(() => []),
    ]);
    
    return (
      <SearchPage
        searchResult={{
          articles: [],
          pagination: {
            page: currentPage,
            limit: 12,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          searchInfo: {
            query: searchQuery || undefined,
            topicId,
            tagIds,
            totalFound: 0,
          },
        }}
        tagGroups={{ tags: allTags }}
        allTopics={allTopics}
        selectedTopicId={topicId}
        error="検索中にエラーが発生しました。しばらく時間をおいて再度お試しください。"
      />
    );
  }
}