-- CreateTable
CREATE TABLE "TaxonomyType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxonomyType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxonomyType_code_key" ON "TaxonomyType"("code");

-- CreateIndex
CREATE INDEX "TaxonomyType_sortOrder_idx" ON "TaxonomyType"("sortOrder");
