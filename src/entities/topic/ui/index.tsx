import { Badge } from "@/shared";
import { type Topic } from "../model";

/**
 * トピックのスケルトン表示コンポーネント
 * ビジネスモデルの基本的なUI表現
 */
export function TopicBadge({ topic }: { topic: Topic }) {
  return (
    <Badge variant="secondary" className="text-xs">
      {topic.name}
    </Badge>
  );
}

/**
 * トピック選択用のリスト表示
 */
export function TopicList({ topics }: { topics: Topic[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic) => (
        <TopicBadge key={topic.id} topic={topic} />
      ))}
    </div>
  );
}
