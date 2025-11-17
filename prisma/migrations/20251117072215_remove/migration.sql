/*
  Warnings:

  - You are about to drop the `file_shares` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[share_token]` on the table `files` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."file_shares" DROP CONSTRAINT "file_shares_file_id_fkey";

-- AlterTable
ALTER TABLE "public"."files" ADD COLUMN     "share_token" TEXT;

-- DropTable
DROP TABLE "public"."file_shares";

-- CreateIndex
CREATE UNIQUE INDEX "files_share_token_key" ON "public"."files"("share_token");
