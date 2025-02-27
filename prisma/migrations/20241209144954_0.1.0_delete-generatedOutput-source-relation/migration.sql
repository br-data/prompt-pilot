-- DropForeignKey
ALTER TABLE "GeneratedOutput" DROP CONSTRAINT "GeneratedOutput_sourceId_fkey";

-- AlterTable
ALTER TABLE "GeneratedOutput" DROP COLUMN "sourceId",
ADD COLUMN     "source" TEXT NOT NULL;

