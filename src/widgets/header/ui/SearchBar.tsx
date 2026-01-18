"use client";

import { useState, useTransition, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Button } from "@/shared";
import { Search, ArrowUpRight, Tag, Users, Hash } from "lucide-react";
import { useDebounce } from "@/shared";

interface SearchResponseTopic {
  id: string;
  name: string;
  description?: string;
  _count: { articles: number };
}

interface SearchResponseTag {
  id: string;
  name: string;
  level: number;
  taxonomyType: string;
  _count: { articles: number };
}

interface SearchResponseUser {
  userId: string;
  displayName: string | null;
  profileImageUrl: string | null;
  _count: { articles: number };
}

interface SearchResponse {
  topics?: SearchResponseTopic[];
  tags?: SearchResponseTag[];
  users?: SearchResponseUser[];
}

interface SearchSuggestion {
  type: 'explore' | 'topic' | 'tag' | 'user';
  id?: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLDivElement>(null);
  
  // 検索クエリのデバウンス（300ms）
  const debouncedQuery = useDebounce(query, 300);

  // デフォルト候補
  const defaultSuggestions: SearchSuggestion[] = useMemo(() => [
    {
      type: 'explore',
      title: '記事を探索する',
      subtitle: '全ての記事を参照',
      icon: <ArrowUpRight className="w-4 h-4" />
    }
  ], []);

  // 候補を取得する関数
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions(defaultSuggestions);
      return;
    }

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data: SearchResponse = await response.json();
        const newSuggestions: SearchSuggestion[] = [];

        // トピック候補
        data.topics?.forEach((topic: SearchResponseTopic) => {
          newSuggestions.push({
            type: 'topic',
            id: topic.id,
            title: topic.name,
            subtitle: `${topic._count?.articles || 0}件の記事`,
            icon: <Hash className="w-4 h-4" />
          });
        });

        // タグ候補（1階層のみ）
        data.tags?.forEach((tag: SearchResponseTag) => {
          newSuggestions.push({
            type: 'tag',
            id: tag.id,
            title: tag.name,
            subtitle: `${tag._count?.articles || 0}件の記事`,
            icon: <Tag className="w-4 h-4" />
          });
        });

        // ユーザー候補
        data.users?.forEach((user: SearchResponseUser) => {
          newSuggestions.push({
            type: 'user',
            id: user.userId,
            title: user.displayName || user.userId,
            subtitle: `@${user.userId}`,
            icon: <Users className="w-4 h-4" />
          });
        });

        // 「記事を探索する」を最後に追加
        newSuggestions.push(...defaultSuggestions);

        setSuggestions(newSuggestions);
      } else {
        setSuggestions(defaultSuggestions);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions(defaultSuggestions);
    }
  }, [defaultSuggestions]);

  // デバウンスされたクエリでの候補取得
  useEffect(() => {
    if (showSuggestions) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, showSuggestions, fetchSuggestions]);

  // 外部クリック時の候補非表示
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // キーボードナビゲーション（Escapeのみ）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 空欄の場合は何もしない
    if (!query.trim()) {
      return;
    }

    startTransition(() => {
      // 既存のパラメータを引き継ぐ
      const params = new URLSearchParams(searchParams?.toString() || "");
      
      // 検索クエリを更新
      params.set("q", query.trim());
      
      router.push(`/search?${params.toString()}`);
      setShowSuggestions(false);
    });
  };

  // 候補選択時の処理
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    startTransition(() => {
      switch (suggestion.type) {
        case 'explore':
          router.push('/search');
          break;
        case 'topic':
          router.push(`/search?topicId=${suggestion.id}`);
          break;
        case 'tag':
          router.push(`/search?tags=${suggestion.id}`);
          break;
        case 'user':
          router.push(`/${suggestion.id}`);
          break;
      }
      setShowSuggestions(false);
      setQuery('');
    });
  };

  const handleFocus = () => {
    setShowSuggestions(true);
    if (suggestions.length === 0) {
      setSuggestions(defaultSuggestions);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="記事を検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-4"
            disabled={isPending}
          />
        </div>
      </form>

      {/* 候補ドロップダウン */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <Button
              key={`${suggestion.type}-${suggestion.id || suggestion.title}`}
              variant="ghost"
              className="w-full justify-start h-auto p-3 rounded-none hover:bg-muted"
              onClick={() => handleSuggestionSelect(suggestion)}
              disabled={isPending}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0 text-muted-foreground">
                  {suggestion.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">
                    {suggestion.title}
                  </div>
                  {suggestion.subtitle && (
                    <div className="text-xs text-muted-foreground">
                      {suggestion.subtitle}
                    </div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
