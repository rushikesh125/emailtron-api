import { GoogleGenAI, Type } from "@google/genai";

// Initialize the API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Ensure API key is set in environment variables

// Define the schema for email analysis report
const emailAnalysisReportSchema = {
  description: "Detailed email analysis report for support-related emails, including sentiment, priority, information extraction, and auto-response generation",
  type: Type.OBJECT,
  properties: {
    email_analysis_report: {
      type: Type.OBJECT,
      properties: {
        sentiment_analysis: {
          type: Type.OBJECT,
          description: "Analysis of the email's sentiment and emotional tone",
          properties: {
            sentiment: {
              type: Type.STRING,
              description: "Overall sentiment of the email (Positive, Negative, Neutral)",
            },
            emotional_score: {
              type: Type.NUMBER,
              description: "Score indicating emotional intensity (0 to 1, higher is more emotional)",
            },
            emotional_indicators: {
              type: Type.ARRAY,
              description: "Words or phrases contributing to the emotional tone",
              items: { type: Type.STRING },
            },
            assessment: {
              type: Type.STRING,
              description: "Summary of how the sentiment impacts the email's urgency or handling in 1-2 sentance",
            },
          },
          required: ["sentiment", "emotional_score", "emotional_indicators", "assessment"],
        },
        priority_assessment: {
          type: Type.OBJECT,
          description: "Evaluation of the email's priority based on content",
          properties: {
            priority: {
              type: Type.STRING,
              description: "Priority level (Urgent, Not Urgent)",
            },
            urgency_indicators: {
              type: Type.ARRAY,
              description: "Keywords or phrases indicating urgency (e.g., 'immediately', 'critical')",
              items: { type: Type.STRING },
            },
            assessment: {
              type: Type.STRING,
              description: "Summary of priority determination",
            },
          },
          required: ["priority", "urgency_indicators", "assessment"],
        },
        information_extraction: {
          type: Type.OBJECT,
          description: "Extraction of key information from the email",
          properties: {
            contact_details: {
              type: Type.OBJECT,
              description: "Extracted contact information",
              properties: {
                phone_number: {
                  type: Type.STRING,
                  description: "Phone number mentioned in the email (or null if none)",
                  nullable: true,
                },
                alternate_email: {
                  type: Type.STRING,
                  description: "Alternate email mentioned (or null if none)",
                  nullable: true,
                },
                other_contacts: {
                  type: Type.ARRAY,
                  description: "Any other contact details (e.g., social media handles)",
                  items: { type: Type.STRING },
                },
              },
              required: ["phone_number", "alternate_email", "other_contacts"],
            },
            customer_requirements: {
              type: Type.ARRAY,
              description: "List of customer requests or requirements",
              items: { type: Type.STRING },
            },
            sentiment_indicators: {
              type: Type.ARRAY,
              description: "Specific positive/negative words or phrases",
              items: { type: Type.STRING },
            },
            metadata: {
              type: Type.OBJECT,
              description: "Additional metadata to help support teams",
              properties: {
                product_mentions: {
                  type: Type.ARRAY,
                  description: "Products or services mentioned in the email",
                  items: { type: Type.STRING },
                },
                issue_summary: {
                  type: Type.STRING,
                  description: "Brief summary of the main issue or query",
                },
              },
              required: ["product_mentions", "issue_summary"],
            },
          },
          required: ["contact_details", "customer_requirements", "sentiment_indicators", "metadata"],
        },
        auto_response_generation: {
          type: Type.OBJECT,
          description: "Generated draft response for the email",
          properties: {
            response_text: {
              type: Type.STRING,
              description: "Full text of the professional, context-aware draft response",
            },
            tone_adjustment: {
              type: Type.STRING,
              description: "Description of tone used (e.g., empathetic if frustrated, friendly otherwise)",
            },
            key_references: {
              type: Type.ARRAY,
              description: "Key elements referenced in the response (e.g., product names, acknowledgments)",
              items: { type: Type.STRING },
            },
            is_ready_to_send: {
              type: Type.BOOLEAN,
              description: "Whether the response is complete and ready for review/sending",
            },
          },
          required: ["response_text", "tone_adjustment", "key_references", "is_ready_to_send"],
        },
        overall_categorization: {
          type: Type.OBJECT,
          description: "Overall categorization and summary",
          properties: {
            category: {
              type: Type.STRING,
              description: "Broad category of the email (e.g., Support Query, Help Request)",
            },
            processing_priority: {
              type: Type.NUMBER,
              description: "Numerical priority score for queuing (1,2,3, lower is more urgent)",
            },
            summary: {
              type: Type.STRING,
              description: "Concise summary of the entire analysis",
            },
          },
          required: ["category", "processing_priority", "summary"],
        },
      },
      required: ["sentiment_analysis", "priority_assessment", "information_extraction", "auto_response_generation", "overall_categorization"],
    },
  },
  required: ["email_analysis_report"],
};

// Function to generate email analysis report
async function generateEmailAnalysisReport(emailData) {
  const inputData = JSON.stringify(emailData);

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `${inputData} Analyze the provided support email based on the given schema, performing sentiment analysis, priority assessment, information extraction, and generating a context-aware auto-response.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: emailAnalysisReportSchema,
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating email analysis report:", error);
    throw error;
  }
}

export { generateEmailAnalysisReport };


