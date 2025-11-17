/*
  Warnings:

  - A unique constraint covering the columns `[share_token]` on the table `folders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."folders" ADD COLUMN     "share_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "folders_share_token_key" ON "public"."folders"("share_token");
