-- CreateTable
CREATE TABLE "public"."emails" (
    "id" TEXT NOT NULL,
    "sender" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_meta" (
    "id" TEXT NOT NULL,
    "sentiment" VARCHAR(50) NOT NULL,
    "priority" VARCHAR(50) NOT NULL,
    "keywords" TEXT[],
    "contacts" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "emailId" TEXT NOT NULL,

    CONSTRAINT "email_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_responses" (
    "id" TEXT NOT NULL,
    "draft" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "emailId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ai_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "emails_userId_idx" ON "public"."emails"("userId");

-- CreateIndex
CREATE INDEX "emails_received_at_idx" ON "public"."emails"("received_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_meta_emailId_key" ON "public"."email_meta"("emailId");

-- CreateIndex
CREATE INDEX "email_meta_emailId_idx" ON "public"."email_meta"("emailId");

-- CreateIndex
CREATE INDEX "ai_responses_emailId_idx" ON "public"."ai_responses"("emailId");

-- CreateIndex
CREATE INDEX "ai_responses_userId_idx" ON "public"."ai_responses"("userId");

-- AddForeignKey
ALTER TABLE "public"."emails" ADD CONSTRAINT "emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_meta" ADD CONSTRAINT "email_meta_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_responses" ADD CONSTRAINT "ai_responses_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_responses" ADD CONSTRAINT "ai_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
