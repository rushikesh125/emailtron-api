-- AlterTable
ALTER TABLE "public"."ai_responses" ADD COLUMN     "isReady" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keyReferences" TEXT[],
ADD COLUMN     "tone" VARCHAR(100);

-- AlterTable
ALTER TABLE "public"."email_meta" ADD COLUMN     "category" VARCHAR(100),
ADD COLUMN     "customerRequirements" TEXT[],
ADD COLUMN     "emotionalIndicators" TEXT[],
ADD COLUMN     "emotionalScore" DOUBLE PRECISION,
ADD COLUMN     "issueSummary" TEXT,
ADD COLUMN     "overallSummary" TEXT,
ADD COLUMN     "priorityAssessment" TEXT,
ADD COLUMN     "processingPriority" INTEGER,
ADD COLUMN     "productMentions" TEXT[],
ADD COLUMN     "sentimentAssessment" TEXT,
ADD COLUMN     "urgencyIndicators" TEXT[];
