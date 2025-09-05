/*
  Warnings:

  - You are about to drop the column `userId` on the `ai_responses` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ai_responses" DROP CONSTRAINT "ai_responses_userId_fkey";

-- DropIndex
DROP INDEX "public"."ai_responses_userId_idx";

-- AlterTable
ALTER TABLE "public"."ai_responses" DROP COLUMN "userId";
