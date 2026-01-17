/*
  Warnings:

  - Added the required column `level` to the `Tag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxonomyType` to the `Tag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TagTaxonomyType" AS ENUM ('INDUSTRY', 'JOB_CATEGORY', 'POSITION', 'SITUATION', 'SKILL_KNOWLEDGE');

-- AlterTable
ALTER TABLE "ArticleTag" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "level" INTEGER NOT NULL,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "taxonomyType" "TagTaxonomyType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "ArticleTag_tagId_articleId_idx" ON "ArticleTag"("tagId", "articleId");

-- CreateIndex
CREATE INDEX "Tag_parentId_idx" ON "Tag"("parentId");

-- CreateIndex
CREATE INDEX "Tag_taxonomyType_level_sortOrder_idx" ON "Tag"("taxonomyType", "level", "sortOrder");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
