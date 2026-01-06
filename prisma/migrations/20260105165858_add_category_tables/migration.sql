/*
  Warnings:

  - You are about to drop the column `category` on the `Occupation` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Skill` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Occupation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Skill` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SkillCategory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupationCategory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OccupationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategory_key_key" ON "SkillCategory"("key");

-- CreateIndex
CREATE UNIQUE INDEX "OccupationCategory_key_key" ON "OccupationCategory"("key");

-- Insert default categories
INSERT INTO "SkillCategory" ("id", "key", "name", "description", "createdAt", "updatedAt") VALUES 
('skill_prog', 'programming', 'プログラミング言語', 'プログラミング言語・スクリプト言語', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('skill_frame', 'framework', 'フレームワーク', 'Webフレームワーク・ライブラリ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('skill_design', 'design', 'デザイン・UI/UX', 'デザインツール・UI/UXスキル', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('skill_marketing', 'marketing', 'マーケティング', 'デジタルマーケティング・分析スキル', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('skill_business', 'business', 'ビジネス・マネジメント', '事業企画・プロジェクト管理スキル', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "OccupationCategory" ("id", "key", "name", "description", "createdAt", "updatedAt") VALUES 
('occ_eng', 'engineering', 'エンジニアリング', 'ソフトウェア開発・技術職', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('occ_design', 'design', 'デザイン', 'UI/UX・グラフィックデザイン', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('occ_business', 'business', 'ビジネス', '企画・経営・営業', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('occ_marketing', 'marketing', 'マーケティング', 'マーケティング・PR・広告', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('occ_other', 'other', 'その他', 'その他の職種', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add categoryId column temporarily as nullable
ALTER TABLE "Skill" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Occupation" ADD COLUMN "categoryId" TEXT;

-- Update existing skills with appropriate category IDs
UPDATE "Skill" SET "categoryId" = 'skill_prog' WHERE "category" = 'programming';
UPDATE "Skill" SET "categoryId" = 'skill_frame' WHERE "category" = 'framework';
UPDATE "Skill" SET "categoryId" = 'skill_design' WHERE "category" = 'design';
UPDATE "Skill" SET "categoryId" = 'skill_marketing' WHERE "category" = 'marketing';
UPDATE "Skill" SET "categoryId" = 'skill_business' WHERE "category" = 'business';

-- Update existing occupations with appropriate category IDs  
UPDATE "Occupation" SET "categoryId" = 'occ_eng' WHERE "category" = 'engineering';
UPDATE "Occupation" SET "categoryId" = 'occ_design' WHERE "category" = 'design';
UPDATE "Occupation" SET "categoryId" = 'occ_business' WHERE "category" = 'business';
UPDATE "Occupation" SET "categoryId" = 'occ_marketing' WHERE "category" = 'marketing';
UPDATE "Occupation" SET "categoryId" = 'occ_other' WHERE "category" NOT IN ('engineering', 'design', 'business', 'marketing');

-- Make categoryId NOT NULL after data migration
ALTER TABLE "Skill" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Occupation" ALTER COLUMN "categoryId" SET NOT NULL;

-- Drop old category columns
ALTER TABLE "Skill" DROP COLUMN "category";
ALTER TABLE "Occupation" DROP COLUMN "category";

-- Create indexes
CREATE INDEX "Occupation_categoryId_idx" ON "Occupation"("categoryId");
CREATE INDEX "Skill_categoryId_idx" ON "Skill"("categoryId");

-- Add foreign key constraints
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SkillCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Occupation" ADD CONSTRAINT "Occupation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "OccupationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
