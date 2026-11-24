-- Phase 4: per-locale narration audio paths (files under data/audio/)
ALTER TABLE "SceneLocalization"
ADD COLUMN "audioPath" TEXT,
ADD COLUMN "audioGeneratedAt" TIMESTAMP(3);