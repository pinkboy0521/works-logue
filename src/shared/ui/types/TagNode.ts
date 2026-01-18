// 共通のTagNode型定義
export interface TagNode {
  id: string;
  name: string;
  level: number;
  taxonomyType: {
    id: string;
    code: string;
    displayName: string;
    sortOrder: number;
  };
  description: string;
  parentId: string | null;
  sortOrder: number;
  children?: TagNode[];
  _count: {
    articles: number;
  };
}
