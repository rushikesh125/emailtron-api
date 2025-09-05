-- CreateIndex
CREATE INDEX "email_meta_category_idx" ON "public"."email_meta"("category");

-- CreateIndex
CREATE INDEX "email_meta_processingPriority_idx" ON "public"."email_meta"("processingPriority");

-- CreateIndex
CREATE INDEX "emails_sender_idx" ON "public"."emails"("sender");
