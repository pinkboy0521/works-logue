-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_topicId_fkey";

-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "topicId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
