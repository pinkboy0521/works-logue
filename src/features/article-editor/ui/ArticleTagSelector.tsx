"use client";

import { useState, useCallback } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/shared";
import { ChevronDown, ChevronRight, Filter, X, Tags } from "lucide-react";
import type { TagNode } from "@/shared";

interface ArticleTagSelectorProps {
  tags: TagNode[];
  selectedTagIds: string[];
  onTagSelectionChange: (tagIds: string[]) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ArticleTagSelector({
  tags,
  selectedTagIds = [],
  onTagSelectionChange,
  className = "",
  isCollapsed = false,
  onToggleCollapse,
}: ArticleTagSelectorProps) {
  // タグを分類ごとにグループ化
  const tagGroups = tags.reduce(
    (acc, tag) => {
      const taxonomyCode = tag.taxonomyType.code;
      if (!acc[taxonomyCode]) {
        acc[taxonomyCode] = [];
      }
      acc[taxonomyCode].push(tag);
      return acc;
    },
    {} as Record<string, TagNode[]>,
  );

  // タクソノミータイプの表示名を取得するためのマップを作成
  const taxonomyDisplayNames = tags.reduce(
    (acc, tag) => {
      acc[tag.taxonomyType.code] = tag.taxonomyType.displayName;
      return acc;
    },
    {} as Record<string, string>,
  );

  // 展開状態を管理（記事編集では初期展開）
  const [expandedTaxonomies, setExpandedTaxonomies] = useState<Set<string>>(
    new Set(Object.keys(tagGroups)),
  );
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 分類の展開・折りたたみ
  const toggleTaxonomy = (taxonomyType: string) => {
    const newExpanded = new Set(expandedTaxonomies);
    if (newExpanded.has(taxonomyType)) {
      newExpanded.delete(taxonomyType);
    } else {
      newExpanded.add(taxonomyType);
    }
    setExpandedTaxonomies(newExpanded);
  };

  // ノードの展開・折りたたみ
  const toggleNode = (tagId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId);
    } else {
      newExpanded.add(tagId);
    }
    setExpandedNodes(newExpanded);
  };

  // タグのチェック状態を取得（階層レベルを考慮）
  const getTagCheckState = (
    tagId: string,
    tagLevel?: number,
  ): "checked" | "unchecked" | "indeterminate" => {
    const isDirectlySelected = selectedTagIds.includes(tagId);
    if (isDirectlySelected) return "checked";

    // 子タグの状態をチェック
    const findTag = (
      targetId: string,
      tags: TagNode[],
    ): TagNode | undefined => {
      for (const tag of tags) {
        if (tag.id === targetId) return tag;
        if (tag.children) {
          const found = findTag(targetId, tag.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    const tag = findTag(tagId, Object.values(tagGroups).flat());
    if (!tag?.children) return "unchecked";

    const getAllDescendantIds = (children: TagNode[]): string[] => {
      const ids: string[] = [];
      for (const child of children) {
        ids.push(child.id);
        if (child.children) {
          ids.push(...getAllDescendantIds(child.children));
        }
      }
      return ids;
    };

    const descendantIds = getAllDescendantIds(tag.children);
    const selectedDescendants = descendantIds.filter((id) =>
      selectedTagIds.includes(id),
    );

    if (selectedDescendants.length === 0) return "unchecked";
    if (selectedDescendants.length === descendantIds.length) return "checked";

    // 第二階層以降(level >= 2)では、部分選択時は常にindeterminateを返す
    const currentLevel = tagLevel || tag.level;
    if (currentLevel >= 2) {
      return "indeterminate";
    }

    return "indeterminate";
  };

  // 選択されたタグの名前を取得（最適化表示ロジック付き）
  const getOptimizedSelectedTagNames = () => {
    const findTagName = (
      targetId: string,
      tags: TagNode[],
    ): string | undefined => {
      for (const tag of tags) {
        if (tag.id === targetId) return tag.name;
        if (tag.children) {
          const found = findTagName(targetId, tag.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    const findTagById = (
      targetId: string,
      tags: TagNode[],
    ): TagNode | undefined => {
      for (const tag of tags) {
        if (tag.id === targetId) return tag;
        if (tag.children) {
          const found = findTagById(targetId, tag.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    const getAllChildIds = (children: TagNode[]): string[] => {
      const ids: string[] = [];
      for (const child of children) {
        ids.push(child.id);
        if (child.children) {
          ids.push(...getAllChildIds(child.children));
        }
      }
      return ids;
    };

    // 表示すべきタグIDを決定
    const tagsToShow = new Set(selectedTagIds);
    const allTags = Object.values(tagGroups).flat();

    // 各選択されたタグについて、最適化ロジックを適用
    for (const tagId of selectedTagIds) {
      const tag = findTagById(tagId, allTags);
      if (!tag) continue;

      // 親タグを探す
      const findParent = (
        targetChildId: string,
        tags: TagNode[],
      ): TagNode | undefined => {
        for (const tag of tags) {
          if (tag.children) {
            if (tag.children.some((child) => child.id === targetChildId)) {
              return tag;
            }
            const found = findParent(targetChildId, tag.children);
            if (found) return found;
          }
        }
        return undefined;
      };

      const parentTag = findParent(tagId, allTags);
      if (parentTag) {
        const parentChildIds = getAllChildIds(parentTag.children!);
        const selectedParentChildIds = parentChildIds.filter((id) =>
          selectedTagIds.includes(id),
        );

        // 親タグの子タグがすべて選択されている場合、子タグを表示対象から除外
        if (selectedParentChildIds.length === parentChildIds.length) {
          parentChildIds.forEach((childId) => tagsToShow.delete(childId));
          tagsToShow.add(parentTag.id);
        }
      }

      // 自分が親タグの場合、部分選択なら自分を表示対象から除外
      if (tag.children) {
        const childIds = getAllChildIds(tag.children);
        const selectedChildIds = childIds.filter((id) =>
          selectedTagIds.includes(id),
        );

        // 部分選択の場合（全ての子が選択されていない場合）、親タグを非表示
        if (
          selectedChildIds.length > 0 &&
          selectedChildIds.length < childIds.length
        ) {
          tagsToShow.delete(tagId);
        }
      }
    }

    return Array.from(tagsToShow).map((id) => ({
      id,
      name: findTagName(id, allTags) || id,
    }));
  };

  // タグの選択・選択解除（タクソノミー仕様対応）
  const handleTagToggle = useCallback(
    (tagId: string) => {
      // タグが親かどうかを判定
      const findTag = (
        targetId: string,
        tags: TagNode[],
      ): TagNode | undefined => {
        for (const tag of tags) {
          if (tag.id === targetId) return tag;
          if (tag.children) {
            const found = findTag(targetId, tag.children);
            if (found) return found;
          }
        }
        return undefined;
      };

      const tag = findTag(tagId, Object.values(tagGroups).flat());
      const hasChildren = tag?.children && tag.children.length > 0;

      let newTagIds: string[];

      if (selectedTagIds.includes(tagId)) {
        if (hasChildren) {
          // 親タグを削除（子タグも削除）
          const getAllChildIds = (children: TagNode[]): string[] => {
            const ids: string[] = [];
            for (const child of children) {
              ids.push(child.id);
              if (child.children) {
                ids.push(...getAllChildIds(child.children));
              }
            }
            return ids;
          };
          const childIds = getAllChildIds(tag.children!);
          newTagIds = selectedTagIds.filter(
            (id) => id !== tagId && !childIds.includes(id),
          );
        } else {
          // 末端タグを削除
          newTagIds = selectedTagIds.filter((id) => id !== tagId);
        }
      } else {
        if (hasChildren) {
          // 親タグを追加（すべての子タグも追加＝タクソノミー仕様）
          const getAllChildIds = (children: TagNode[]): string[] => {
            const ids: string[] = [];
            for (const child of children) {
              ids.push(child.id);
              if (child.children) {
                ids.push(...getAllChildIds(child.children));
              }
            }
            return ids;
          };
          const childIds = getAllChildIds(tag.children!);
          const tagsToAdd = [tagId, ...childIds].filter(
            (id) => !selectedTagIds.includes(id),
          );
          newTagIds = [...selectedTagIds, ...tagsToAdd];
        } else {
          // 末端タグを追加
          newTagIds = [...selectedTagIds, tagId];
        }
      }

      onTagSelectionChange(newTagIds);
    },
    [selectedTagIds, tagGroups, onTagSelectionChange],
  );

  const clearAllTags = useCallback(() => {
    onTagSelectionChange([]);
  }, [onTagSelectionChange]);

  const renderTagNode = (tag: TagNode, depth = 0) => {
    const checkState = getTagCheckState(tag.id, tag.level);
    const isSelected = checkState === "checked";
    const isIndeterminate = checkState === "indeterminate";
    const hasChildren = tag.children && tag.children.length > 0;
    const isExpanded = expandedNodes.has(tag.id);
    const indent = depth * 16;

    return (
      <div key={tag.id} className="select-none">
        <div
          className="flex items-center py-1.5 hover:bg-muted/50 rounded-sm"
          style={{ paddingLeft: `${indent + 8}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-4 w-4 mr-2"
              onClick={() => toggleNode(tag.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}

          <label
            className={`
              flex-1 flex items-center justify-between text-left py-1 px-2 rounded-sm transition-colors cursor-pointer
              ${isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/30"}
              ${!hasChildren ? "ml-6" : ""}
            `}
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={() => handleTagToggle(tag.id)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-sm">{tag.name}</span>
            </div>
          </label>
        </div>

        {hasChildren && isExpanded && tag.children && (
          <div>
            {tag.children.map((child) => renderTagNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const hasSelectedTags = selectedTagIds.length > 0;

  // 折りたたみ状態の場合は縮小表示
  if (isCollapsed) {
    return (
      <div className={`${className}`}>
        <Card className="w-12">
          <CardContent className="p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="w-8 h-8 p-0"
            >
              <Tags className="w-5 h-5" />
            </Button>
            {hasSelectedTags && (
              <div className="mt-2">
                <Badge
                  variant="secondary"
                  className="text-xs px-1 py-0.5 w-8 text-center"
                >
                  {selectedTagIds.length}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-80 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="w-4 h-4" />
              タグ選択
              {onToggleCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapse}
                  className="ml-auto p-1 h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
            {hasSelectedTags && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllTags}
                className="text-muted-foreground hover:text-foreground"
              >
                クリア
              </Button>
            )}
          </div>

          {hasSelectedTags && (
            <div className="flex flex-wrap gap-1">
              {getOptimizedSelectedTagNames().map(({ id, name }) => (
                <Badge
                  key={id}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  {name}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0 max-h-96 overflow-y-auto">
          {Object.entries(tagGroups).map(([taxonomyType, tags]) => (
            <div key={taxonomyType} className="mb-3">
              <button
                onClick={() => toggleTaxonomy(taxonomyType)}
                className="flex items-center justify-between w-full py-2 px-1 text-left hover:bg-muted/30 rounded-sm"
              >
                <span className="font-medium text-sm">
                  {taxonomyDisplayNames[taxonomyType] || taxonomyType}
                </span>
                {expandedTaxonomies.has(taxonomyType) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {expandedTaxonomies.has(taxonomyType) && (
                <div className="mt-1">
                  {tags.map((tag) => renderTagNode(tag))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
