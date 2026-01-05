import { type Topic } from "../model";

/**
 * トピック関連の計算ロジック・変換処理
 * ストレージに依存しないエンティティ操作関数
 */

/**
 * トピック名のバリデーション
 */
export function isValidTopicName(name: string): boolean {
  return name.length > 0 && name.length <= 50;
}

/**
 * トピックをソート（名前順）
 */
export function sortTopicsByName(topics: Topic[]): Topic[] {
  return [...topics].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * トピック名の正規化（前後の空白削除、小文字統一）
 */
export function normalizeTopicName(name: string): string {
  return name.trim().toLowerCase();
}
