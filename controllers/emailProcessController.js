// // queue.js
// import PQueue from "p-queue";

// import { generateEmailAnalysisReport } from "../aimodels/emailMetaData.js";
// import { prisma } from "../index.js";
// import { saveAnalysisToDB } from "../utils/analysiToDb.js";

// export const queue = new PQueue({ concurrency: 1 });

// // Add a single email to the queue
// export async function enqueueEmail(email) {
//   queue.add(async () => {
//     try {
//       const analysis = await generateEmailAnalysisReport(email);
//       await saveAnalysisToDB(email.id, analysis);
//       console.log(`✅ Processed email ${email.id}`);
//     } catch (err) {
//       console.error(`❌ Failed to process email ${email.id}`, err);
//     }
//   });
// }

// // Batch processor (for cron/manual trigger)
// export async function processEmails(userId ) {
//   const emails = await prisma.email.findMany({
//     where: {
//       userId: userId,
//       meta: { is: null }, // only emails without metadata
//     },
//   });

//   for (const email of emails) {
//     await enqueueEmail(email);
//   }

//   await queue.onIdle(); // wait until all jobs done
//   console.log("✅ All pending emails processed");
// }
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
