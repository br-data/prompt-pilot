-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "msg" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "attempt" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedOutputId" INTEGER,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_generatedOutputId_fkey" FOREIGN KEY ("generatedOutputId") REFERENCES "GeneratedOutput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

