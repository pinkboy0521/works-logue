/*
  Warnings:

  - A unique constraint covering the columns `[parentId,name]` on the table `tags` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tags_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "tags_parentId_name_key" ON "tags"("parentId", "name");
