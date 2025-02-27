-- CreateTable
CREATE TABLE "Source" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testsetId" INTEGER NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt" (
    "versionId" SERIAL NOT NULL,
    "promptId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variance" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("versionId")
);

-- CreateTable
CREATE TABLE "Testset" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "testable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnotationList" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testsetName" TEXT NOT NULL,
    "testset" TEXT[],

    CONSTRAINT "AnnotationList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedOutput" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,
    "annotationListId" INTEGER NOT NULL,

    CONSTRAINT "GeneratedOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "reviewEffortScale" INTEGER NOT NULL,
    "feedbackText" TEXT,
    "userId" INTEGER NOT NULL,
    "generatedOutputId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AnnotationListPrompts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_AnnotationListPrompts_AB_unique" ON "_AnnotationListPrompts"("A", "B");

-- CreateIndex
CREATE INDEX "_AnnotationListPrompts_B_index" ON "_AnnotationListPrompts"("B");

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_testsetId_fkey" FOREIGN KEY ("testsetId") REFERENCES "Testset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedOutput" ADD CONSTRAINT "GeneratedOutput_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedOutput" ADD CONSTRAINT "GeneratedOutput_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Prompt"("versionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedOutput" ADD CONSTRAINT "GeneratedOutput_annotationListId_fkey" FOREIGN KEY ("annotationListId") REFERENCES "AnnotationList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_generatedOutputId_fkey" FOREIGN KEY ("generatedOutputId") REFERENCES "GeneratedOutput"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnotationListPrompts" ADD CONSTRAINT "_AnnotationListPrompts_A_fkey" FOREIGN KEY ("A") REFERENCES "AnnotationList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnotationListPrompts" ADD CONSTRAINT "_AnnotationListPrompts_B_fkey" FOREIGN KEY ("B") REFERENCES "Prompt"("versionId") ON DELETE CASCADE ON UPDATE CASCADE;
