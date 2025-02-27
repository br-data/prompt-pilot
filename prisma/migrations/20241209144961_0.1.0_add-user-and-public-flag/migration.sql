-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "public" BOOLEAN;

-- AlterTable
ALTER TABLE "Testset" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "public" BOOLEAN;

-- AlterTable
ALTER TABLE "AnnotationList" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "public" BOOLEAN;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testset" ADD CONSTRAINT "Testset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnotationList" ADD CONSTRAINT "AnnotationList_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

