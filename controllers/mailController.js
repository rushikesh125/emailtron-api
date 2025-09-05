import { prisma } from "../index.js";


export const getEmailsController = async (req, res) => {
  try {
    const userId = req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Check if user exists
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

    // Get emails with completed analysis (both meta and responses exist)
    const emailsWithAnalysis = await prisma.email.findMany({
      where: {
        userId: userId, 
        AND: [
          {
            meta: {
              isNot: null // Changed from NOT: null to isNot: null
            }
          }
        ]
      },
      include: {
        meta: true,
      },
      orderBy: {
        receivedAt: 'desc'
      }
    });

    return res.status(200).json({
      message: "Emails with analysis fetched successfully",
      count: emailsWithAnalysis.length,
      emails: emailsWithAnalysis
    });

  } catch (error) {
    console.error("Error in getEmailsController:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export const getEmailsWithFilters = async (req, res) => {
  try {
    // Extract userId from request body
    const { userId } = req.body;

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return res.status(400).json({ message: 'Valid userId is required in the request body' });
    }

    // Extract query parameters
    const {
      sentiment,
      priority,
      category,
      processingPriority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
      search = ''
    } = req.query;

    // Build where clause for filtering
    const where = {
      userId, // Restrict to emails for the authenticated user
      meta: {
        AND: [
          sentiment ? { sentiment: { equals: sentiment } } : {},
          priority ? { priority: { equals: priority } } : {},
          category ? { category: { contains: category, mode: 'insensitive' } } : {},
          processingPriority ? { processingPriority: { equals: parseInt(processingPriority) } } : {},
          search ? {
            OR: [
              { issueSummary: { contains: search, mode: 'insensitive' } },
              { overallSummary: { contains: search, mode: 'insensitive' } },
              { sentimentAssessment: { contains: search, mode: 'insensitive' } },
              { priorityAssessment: { contains: search, mode: 'insensitive' } }
            ]
          } : {}
        ]
      }
    };

    // Validate sortBy field
    const validSortFields = ['sentiment', 'priority', 'category', 'processingPriority', 'createdAt', 'updatedAt'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    // Build orderBy clause, accounting for fields in the meta relation
    const orderBy = orderByField === 'sentiment' || orderByField === 'priority' || 
                    orderByField === 'category' || orderByField === 'processingPriority'
      ? { meta: { [orderByField]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc' } }
      : { [orderByField]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc' };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Fetch emails with meta
    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where,
        include: {
          meta: true
        },
        orderBy,
        skip,
        take
      }),
      prisma.email.count({
        where
      })
    ]);

    // Format response
    const response = {
      message: 'Emails with analysis fetched successfully',
      count: total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      emails
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const dataForDashboardController = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return res.status(400).json({ message: 'Valid userId is required in the request body' });
    }

    // Total emails for the user
    const totalEmails = await prisma.email.count({
      where: { userId },
    });

    // Urgent emails count
    const urgentEmails = await prisma.emailMeta.count({
      where: { email: { userId }, priority: 'Urgent' },
    });

    // Emails by sentiment
    const sentimentCounts = await prisma.emailMeta.groupBy({
      by: ['sentiment'],
      _count: { id: true },
      where: { email: { userId } },
    });

    // Emails by category
    const categoryCounts = await prisma.emailMeta.groupBy({
      by: ['category'],
      _count: { id: true },
      where: { email: { userId } },
    });

    // Emails by processingPriority
    const processingPriorityCounts = await prisma.emailMeta.groupBy({
      by: ['processingPriority'],
      _count: { id: true },
      where: { email: { userId } },
    });

    // Average emotional score
    const avgEmotionalScore = await prisma.emailMeta.aggregate({
      _avg: { emotionalScore: true },
      where: { email: { userId } },
    });

    // Compile response
    const dashboardData = {
      totalEmails,
      urgentEmails,
      sentimentCounts: sentimentCounts.map(({ sentiment, _count }) => ({
        sentiment,
        count: _count.id,
      })),
      categoryCounts: categoryCounts.map(({ category, _count }) => ({
        category,
        count: _count.id,
      })),
      processingPriorityCounts: processingPriorityCounts.map(({ processingPriority, _count }) => ({
        processingPriority,
        count: _count.id,
      })),
      averageEmotionalScore: avgEmotionalScore._avg.emotionalScore || 0,
    };

    res.status(200).json({
      message: 'Dashboard data fetched successfully',
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

