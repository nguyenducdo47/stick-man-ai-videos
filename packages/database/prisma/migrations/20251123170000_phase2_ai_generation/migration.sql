-- CreateEnum
CREATE TYPE "AiGenerationKind" AS ENUM ('SCRIPT', 'STORYBOARD');

-- CreateEnum
CREATE TYPE "AiGenerationStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "AiGeneration" (
    "id" BIGSERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "projectId" BIGINT NOT NULL,
    "kind" "AiGenerationKind" NOT NULL,
    "status" "AiGenerationStatus" NOT NULL,
    "model" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiGeneration_publicId_key" ON "AiGeneration"("publicId");

-- CreateIndex
CREATE INDEX "AiGeneration_projectId_idx" ON "AiGeneration"("projectId");

-- CreateIndex
CREATE INDEX "AiGeneration_createdAt_idx" ON "AiGeneration"("createdAt");

-- AddForeignKey
ALTER TABLE "AiGeneration" ADD CONSTRAINT "AiGeneration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;