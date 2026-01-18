/*
  Warnings:

  - You are about to drop the column `taxonomyTypeId` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the `TaxonomyType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `taxonomyType` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TagTaxonomyType" AS ENUM ('INDUSTRY', 'JOB_CATEGORY', 'POSITION', 'SITUATION', 'SKILL_METHOD', 'KNOWLEDGE');

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_taxonomyTypeId_fkey";

-- DropIndex
DROP INDEX "Tag_taxonomyTypeId_level_sortOrder_idx";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "taxonomyTypeId",
ADD COLUMN     "taxonomyType" "TagTaxonomyType" NOT NULL;

-- DropTable
DROP TABLE "TaxonomyType";

-- CreateIndex
CREATE INDEX "Tag_taxonomyType_level_sortOrder_idx" ON "Tag"("taxonomyType", "level", "sortOrder");
