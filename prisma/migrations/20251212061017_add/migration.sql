-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "storage_limit" INTEGER NOT NULL DEFAULT 52428800,
ADD COLUMN     "storage_used" INTEGER NOT NULL DEFAULT 0;
