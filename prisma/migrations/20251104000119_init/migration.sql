-- AlterTable
ALTER TABLE "public"."files" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "width" INTEGER;

-- CreateTable
CREATE TABLE "public"."FileShare" (
    "id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileShare_token_key" ON "public"."FileShare"("token");

-- CreateIndex
CREATE INDEX "FileShare_token_idx" ON "public"."FileShare"("token");

-- AddForeignKey
ALTER TABLE "public"."FileShare" ADD CONSTRAINT "FileShare_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
