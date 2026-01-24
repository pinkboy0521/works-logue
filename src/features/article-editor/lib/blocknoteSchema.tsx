// 共有BlockNoteスキーマ（編集・表示共通）
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";


// 統一Schema（アプリケーション全体で1つ）
export const articleSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,    
  },
});

export type ArticleSchema = typeof articleSchema;