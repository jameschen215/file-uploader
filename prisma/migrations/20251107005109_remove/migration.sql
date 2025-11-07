/*
  Warnings:

  - You are about to drop the column `public_url` on the `files` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."files" DROP COLUMN "public_url";
