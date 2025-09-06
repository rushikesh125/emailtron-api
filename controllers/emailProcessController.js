import PQueue from "p-queue";

import { generateEmailAnalysisReport } from "../aimodels/emailMetaData.js";
import { prisma } from "../index.js";
import { saveAnalysisToDB } from "../utils/analysiToDb.js";

export const queue = new PQueue({ concurrency: 1 });

// Add a single email to the queue
export async function enqueueEmail(email) {
  return queue.add(async () => {
    try {
      const analysis = await generateEmailAnalysisReport(email);
      await saveAnalysisToDB(email.id, analysis);
      console.log(`✅ Processed email ${email.id}`);
      return analysis; // Return analysis for potential use
    } catch (err) {
      console.error(`❌ Failed to process email ${email.id}`, err);
      throw err; // Rethrow to handle in calling function
    }
  });
}

// Batch processor (for cron/manual trigger)
export async function processEmails(userId) {
  const emails = await prisma.email.findMany({
    where: {
      userId: userId,
      meta: { is: null }, // only emails without metadata
    },
  });

  for (const email of emails) {
    await enqueueEmail(email);
  }

  await queue.onIdle(); // wait until all jobs done
  console.log("✅ All pending emails processed");
}

export async function getEmailAnalysis(req, res) {
  const emailData = req.body;

  try {
    const aiRes = await generateEmailAnalysisReport(emailData);
    res.status(200).json(aiRes);
  } catch (error) {
    res.status(500).json({ message: "error process ai response" });
  }
}

export async function getUnprocessedEmails(req, res) {
  const userId = req.body.userId;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        msg: "User does not exist",
      });
    }
    const unprocessedEmails = await prisma.email.findMany({
      where: {
        userId: userId,
        AND: [
          {
            meta: {
              is: null,
            },
          },
        ],
      },
    });
    return res.status(200).json({ remaning: unprocessedEmails.length,message:`${unprocessedEmails.length} Remaning to Process with AI ` });
  } catch (error) {
    res.status(500).json({ message: "error fetching unprocesses emails" });
  }
}
export async function getProcessedMailData(req, res) {
  const userId = req.body.userId;
  const emailId = req.params.emailId;
  
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        msg: "User does not exist",
      });
    }
    
    const processedMail = await prisma.email.findFirst({
      where: {
        userId: userId,
        id: emailId,
      },
      include: {
        meta: true,
        responses: true, // Include AI responses as well
      }
    });
    
    if (!processedMail) {
      return res.status(404).json({
        msg: "Email not found",
      });
    }
    
    // Return the email with meta and responses (if they exist)
    return res.status(200).json(processedMail);
  } catch (error) {
    console.error("Error fetching email:", error);
    return res.status(500).json({ message: "Error fetching email" });
  }
}