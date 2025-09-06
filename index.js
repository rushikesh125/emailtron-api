import express from 'express';
import dotenv from 'dotenv';
import userRouter from './routes/userRoute.js';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { PassThrough } from 'stream';
import { parse as csvParse } from 'csv-parse';
import { parse as chronoParse } from 'chrono-node';
import cors from 'cors';
import aiAnalysisRouter from './routes/aiAnalysis.js';
import { getProcessedMailData, getUnprocessedEmails, processEmails } from './controllers/emailProcessController.js';
import { mailRouter } from './routes/mailRoute.js';
import { dataForDashboardController, getEmailsWithFilters } from './controllers/mailController.js';

export const prisma = new PrismaClient();

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
  res.json({ msg: 'Hello' });
});
app.use('/users', userRouter);

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv' && file.mimetype !== 'application/vnd.ms-excel') {
      return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
  },
});

async function handler(req, res) {
  console.log('/upload called ')
  const userId = req.body.userId;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const errors = [];

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const bufferStream = new PassThrough();
    bufferStream.end(req.file.buffer);

    const emailData = [];
    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(
          csvParse({
            columns: true,
            trim: true,
            skip_empty_lines: true,
          })
        )
        .on('data', (row) => {
          try {
            if (!row.sender || !row.subject || !row.body || !row.sent_date) {
              errors.push({ row, error: 'Missing required fields' });
              return;
            }

            const parsedDate = chronoParse(row.sent_date)[0]?.start.date();
            if (!parsedDate || isNaN(parsedDate.getTime())) {
              errors.push({ row, error: 'Invalid sent_date format' });
              return;
            }

            if (row.sender.length > 255 || row.subject.length > 255) {
              errors.push({ row, error: 'Sender or subject exceeds 255 characters' });
              return;
            }

            emailData.push({
              sender: row.sender,
              subject: row.subject,
              body: row.body,
              receivedAt: parsedDate,
              userId,
            });
          } catch (err) {
            errors.push({ row, error: err.message });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Use createMany with skipDuplicates to avoid duplicates
    let count = 0;
    if (emailData.length > 0) {
      const result = await prisma.email.createMany({
        data: emailData,
        skipDuplicates: true,
      });
      count = result.count;
    }

    // Respond to user immediately
    res.status(201).json({
      message: 'Emails imported successfully ✅',
      count,
      errors: errors.length > 0 ? errors : undefined,
    });

    // Trigger processing in background
    setImmediate(async () => {
      try {
        await processEmails(userId); // You fixed this to accept userId directly
        console.log(`✅ Background processing completed for user ${userId}`);
      } catch (err) {
        console.error(`❌ Background processing failed for user ${userId}:`, err);
      }
    });

  } catch (err) {
    console.error('Upload handler error:', err);
    res.status(500).json({ error: `Processing failed: ${err.message}` });
  }
}

app.post('/upload', upload.single('file'), handler);
app.use('/aianalysis', aiAnalysisRouter);

// Fix: get userId from query params for GET requests
app.get("/nometaemail", async (req, res) => {
  const userId = req.query.userId; // Use query params for GET
  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const res_emails = await prisma.email.findMany({
      where: {
        userId: userId,
        meta: { is: null },
      },
    });
    res.status(200).json(res_emails);
  } catch (error) {
    console.error("❌ Error fetching emails without meta", error);
    res.status(500).json({ message: "❌ Failed to fetch emails", error: error.message });
  }
});

// Process emails endpoint
app.post('/process-emails', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    await processEmails(userId); // You fixed this to accept userId directly
    res.json({ message: 'Email processing completed ✅' });
  } catch (err) {
    console.error('Error processing emails:', err);
    res.status(500).json({ error: 'Failed to process emails ❌' });
  }
});
app.post("/emails",getEmailsWithFilters)
app.post("/dashboard",dataForDashboardController)
app.post('/unprocessedmails',getUnprocessedEmails)
app.post('/myemail/:emailId',getProcessedMailData)



app.listen(PORT, () => {
  console.log(`🚀 Server started on PORT: ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});