import { prisma } from "../index.js";

export async function saveAnalysisToDB(emailId, aiResponseJson) {
  const report = aiResponseJson.email_analysis_report;

  // Save EmailMeta
  await prisma.emailMeta.upsert({
    where: { emailId },
    update: {
      sentiment: report.sentiment_analysis.sentiment,
      emotionalScore: report.sentiment_analysis.emotional_score,
      emotionalIndicators: report.sentiment_analysis.emotional_indicators,
      sentimentAssessment: report.sentiment_analysis.assessment,

      priority: report.priority_assessment.priority,
      urgencyIndicators: report.priority_assessment.urgency_indicators,
      priorityAssessment: report.priority_assessment.assessment,

      keywords: report.information_extraction.sentiment_indicators,
      contacts: [
        report.information_extraction.contact_details.phone_number,
        report.information_extraction.contact_details.alternate_email,
        ...(report.information_extraction.contact_details.other_contacts || [])
      ].filter(Boolean),
      customerRequirements: report.information_extraction.customer_requirements,
      productMentions: report.information_extraction.metadata?.product_mentions || [],
      issueSummary: report.information_extraction.metadata?.issue_summary || null,

      category: report.overall_categorization.category,
      processingPriority: report.overall_categorization.processing_priority,
      overallSummary: report.overall_categorization.summary,
    },
    create: {
      emailId,
      sentiment: report.sentiment_analysis.sentiment,
      emotionalScore: report.sentiment_analysis.emotional_score,
      emotionalIndicators: report.sentiment_analysis.emotional_indicators,
      sentimentAssessment: report.sentiment_analysis.assessment,

      priority: report.priority_assessment.priority,
      urgencyIndicators: report.priority_assessment.urgency_indicators,
      priorityAssessment: report.priority_assessment.assessment,

      keywords: report.information_extraction.sentiment_indicators,
      contacts: [
        report.information_extraction.contact_details.phone_number,
        report.information_extraction.contact_details.alternate_email,
        ...(report.information_extraction.contact_details.other_contacts || [])
      ].filter(Boolean),
      customerRequirements: report.information_extraction.customer_requirements,
      productMentions: report.information_extraction.metadata?.product_mentions || [],
      issueSummary: report.information_extraction.metadata?.issue_summary || null,

      category: report.overall_categorization.category,
      processingPriority: report.overall_categorization.processing_priority,
      overallSummary: report.overall_categorization.summary,
    },
  });

  // Save AIResponse
  await prisma.aIResponse.create({
    data: {
      draft: report.auto_response_generation.response_text,
      tone: report.auto_response_generation.tone_adjustment,
      keyReferences: report.auto_response_generation.key_references,
      status: report.auto_response_generation.is_ready_to_send ? "ready" : "pending",
      isReady: report.auto_response_generation.is_ready_to_send,
      emailId,
    },
  });

  console.log(`✅ Analysis + draft saved for email ${emailId}`);
}
