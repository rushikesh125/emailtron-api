/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `users` table. All the data in the column will be lost.
  - Added the required column `userid` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
DROP COLUMN "refreshToken",
ADD COLUMN     "photoURL" TEXT NOT NULL DEFAULT '/profile.png',
ADD COLUMN     "userid" TEXT NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("userid");
