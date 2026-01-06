/*
  Warnings:

  - You are about to drop the column `emailVerificationExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_emailVerificationToken_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerificationExpiresAt",
DROP COLUMN "emailVerificationToken",
DROP COLUMN "name";
