-- AlterTable
ALTER TABLE "public"."file_shares" ADD COLUMN     "access_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "max_access" INTEGER;
