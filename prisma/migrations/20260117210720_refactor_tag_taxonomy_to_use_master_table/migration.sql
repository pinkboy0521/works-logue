/*
  Warnings:

  - You are about to drop the column `taxonomyType` on the `Tag` table. All the data in the column will be lost.
  - Added the required column `taxonomyTypeId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/

-- 最初にTaxonomyTypeのマスタデータを挿入
INSERT INTO "TaxonomyType" ("id", "code", "displayName", "sortOrder", "createdAt", "updatedAt") VALUES
('cm5rbxh7800000ck61hn7gj2g', 'INDUSTRY', '業界', 1, NOW(), NOW()),
('cm5rbxh7800010ck6p8n3jk4h', 'JOB_CATEGORY', '職種', 2, NOW(), NOW()),
('cm5rbxh7800020ck6r5m8nl9j', 'POSITION', '役職・立場', 3, NOW(), NOW()),
('cm5rbxh7800030ck6t2k7mp6l', 'SITUATION', '状況', 4, NOW(), NOW()),
('cm5rbxh7800040ck6v9j6nq3m', 'SKILL_METHOD', 'スキル・メソッド', 5, NOW(), NOW()),
('cm5rbxh7800050ck6x8h5or4n', 'KNOWLEDGE', 'ナレッジ', 6, NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;

-- 一時的にtaxonomyTypeIdカラムを追加（NULLを許可）
ALTER TABLE "Tag" ADD COLUMN "taxonomyTypeId" TEXT;

-- 既存データのマイグレーション
UPDATE "Tag" SET "taxonomyTypeId" = (
  CASE 
    WHEN "taxonomyType" = 'INDUSTRY' THEN 'cm5rbxh7800000ck61hn7gj2g'
    WHEN "taxonomyType" = 'JOB_CATEGORY' THEN 'cm5rbxh7800010ck6p8n3jk4h'
    WHEN "taxonomyType" = 'POSITION' THEN 'cm5rbxh7800020ck6r5m8nl9j'
    WHEN "taxonomyType" = 'SITUATION' THEN 'cm5rbxh7800030ck6t2k7mp6l'
    WHEN "taxonomyType" = 'SKILL_KNOWLEDGE' THEN 'cm5rbxh7800040ck6v9j6nq3m'
    -- 将来的に他の値があった場合のために
    ELSE NULL
  END
);

-- taxonomyTypeIdをNOT NULLに変更
ALTER TABLE "Tag" ALTER COLUMN "taxonomyTypeId" SET NOT NULL;

-- DropIndex
DROP INDEX "Tag_taxonomyType_level_sortOrder_idx";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "taxonomyType";

-- DropEnum
DROP TYPE "TagTaxonomyType";

-- CreateIndex
CREATE INDEX "Tag_taxonomyTypeId_level_sortOrder_idx" ON "Tag"("taxonomyTypeId", "level", "sortOrder");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_taxonomyTypeId_fkey" FOREIGN KEY ("taxonomyTypeId") REFERENCES "TaxonomyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
