-- CreateEnum
CREATE TYPE "ProjectRenderStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "ProjectRender" (
    "id" BIGSERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "projectId" BIGINT NOT NULL,
    "locale" TEXT NOT NULL,
    "status" "ProjectRenderStatus" NOT NULL,
    "videoPath" TEXT,
    "errorMessage" TEXT,
    "durationSec" DOUBLE PRECISION,
    "sceneCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectRender_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRender_publicId_key" ON "ProjectRender"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRender_projectId_locale_key" ON "ProjectRender"("projectId", "locale");

-- CreateIndex
CREATE INDEX "ProjectRender_projectId_idx" ON "ProjectRender"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectRender" ADD CONSTRAINT "ProjectRender_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;