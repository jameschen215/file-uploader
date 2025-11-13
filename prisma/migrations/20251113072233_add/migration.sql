/*
  Warnings:

  - You are about to drop the `FileShare` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."FileShare" DROP CONSTRAINT "FileShare_file_id_fkey";

-- DropTable
DROP TABLE "public"."FileShare";

-- CreateTable
CREATE TABLE "public"."file_shares" (
    "id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_shares_token_key" ON "public"."file_shares"("token");

-- CreateIndex
CREATE INDEX "file_shares_token_idx" ON "public"."file_shares"("token");

-- AddForeignKey
ALTER TABLE "public"."file_shares" ADD CONSTRAINT "file_shares_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
