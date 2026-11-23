-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'SCRIPTING', 'STORYBOARD', 'READY');

-- DropTable
DROP TABLE "HealthCheck";

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "email" TEXT,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" BIGSERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "userId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "targetDurationSec" INTEGER,
    "targetSceneCount" INTEGER,
    "languages" TEXT[],
    "visualStyle" TEXT,
    "scriptDraft" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" BIGSERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "projectId" BIGINT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "characterAction" TEXT,
    "animationPreset" TEXT,
    "cameraPreset" TEXT,
    "durationSec" DOUBLE PRECISION,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneLocalization" (
    "id" BIGSERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "sceneId" BIGINT NOT NULL,
    "locale" TEXT NOT NULL,
    "narration" TEXT,
    "subtitles" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SceneLocalization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_publicId_key" ON "User"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_publicId_key" ON "Project"("publicId");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Scene_publicId_key" ON "Scene"("publicId");

-- CreateIndex
CREATE INDEX "Scene_projectId_idx" ON "Scene"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Scene_projectId_sortOrder_key" ON "Scene"("projectId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SceneLocalization_publicId_key" ON "SceneLocalization"("publicId");

-- CreateIndex
CREATE INDEX "SceneLocalization_sceneId_idx" ON "SceneLocalization"("sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "SceneLocalization_sceneId_locale_key" ON "SceneLocalization"("sceneId", "locale");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneLocalization" ADD CONSTRAINT "SceneLocalization_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;