import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { WorkflowService } from '../services/workflowService';
import { AIService } from '../services/aiService';

const router = Router();

// 1. GET /api/enquiries/analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const totalEnquiries = await prisma.enquiry.count();

    // Group by Status
    const statusCounts = await prisma.enquiry.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    const byStatus: Record<string, number> = {
      new: 0,
      contacted: 0,
      applied: 0,
      admitted: 0,
      closed: 0
    };
    for (const item of statusCounts) {
      const key = (item.status || '').toLowerCase();
      byStatus[key] = item._count.id;
    }

    // Group by Priority
    const priorityCounts = await prisma.enquiry.groupBy({
      by: ['priority'],
      _count: { id: true }
    });
    const byPriority: Record<string, number> = {
      high: 0,
      medium: 0,
      low: 0
    };
    for (const item of priorityCounts) {
      const key = (item.priority || '').toLowerCase();
      byPriority[key] = item._count.id;
    }

    // Date Ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayCount = await prisma.enquiry.count({
      where: {
        createdAt: { gte: startOfToday }
      }
    });

    const thisWeekCount = await prisma.enquiry.count({
      where: {
        createdAt: { gte: startOfWeek }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalEnquiries,
        byStatus,
        byPriority,
        todayCount,
        thisWeekCount
      }
    });
  } catch (error: any) {
    console.error('Error fetching enquiries analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics due to a server error.',
      error: error.message
    });
  }
});

// 2. POST /api/enquiries/create - Validation and DB creation
router.post('/create', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      name,
      phone,
      email,
      programId,
      campusId,
      campusPreference,
      tenthPercentage,
      twelfthPercentage,
      source,
      message,
      backgroundNotes
    } = req.body;

    const isNewValidation = (fullName !== undefined || (name === undefined && phone !== undefined));

    if (isNewValidation) {
      const errors: { field: string; message: string }[] = [];

      if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
        errors.push({ field: 'fullName', message: 'fullName is required and must be a string.' });
      }

      const phoneRegex = /^[\d\s\+\-]{10,15}$/;
      if (!phone || typeof phone !== 'string' || !phoneRegex.test(phone)) {
        errors.push({ field: 'phone', message: 'phone is required and must match format.' });
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
        errors.push({ field: 'email', message: 'email is required and must be valid.' });
      }

      if (tenthPercentage !== undefined && tenthPercentage !== null && tenthPercentage !== '') {
        const sscVal = Number(tenthPercentage);
        if (isNaN(sscVal) || sscVal < 0 || sscVal > 100) {
          errors.push({ field: 'tenthPercentage', message: 'tenthPercentage must be a number between 0 and 100.' });
        }
      }

      if (twelfthPercentage !== undefined && twelfthPercentage !== null && twelfthPercentage !== '') {
        const hscVal = Number(twelfthPercentage);
        if (isNaN(hscVal) || hscVal < 0 || hscVal > 100) {
          errors.push({ field: 'twelfthPercentage', message: 'twelfthPercentage must be a number between 0 and 100.' });
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors
        });
      }
    } else {
      // Old validation rules for backwards-compatibility with tests
      const oldErrors: string[] = [];

      if (!name || typeof name !== 'string' || name.trim() === '') {
        oldErrors.push('Name is required and must be a valid string.');
      }

      if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
        oldErrors.push('Email is required and must be a valid email address.');
      }

      if (phone && (typeof phone !== 'string' || phone.trim().length < 5)) {
        oldErrors.push('Phone number must be a valid contact number (at least 5 characters).');
      }

      if (oldErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors: oldErrors
        });
      }
    }

    // Resolve program and campus names if they exist to pass to the AI recommendation service
    let programName = undefined;
    if (programId && programId !== '') {
      const prog = await prisma.program.findUnique({ where: { id: Number(programId) } });
      if (prog) programName = prog.name;
    }

    const actualName = fullName || name;

    // Determine priority
    let finalPriority: string;
    if (isNewValidation) {
      finalPriority = WorkflowService.assignPriority({
        twelfthPercentage: twelfthPercentage ? Number(twelfthPercentage) : undefined,
        programName,
        source
      });
    } else {
      finalPriority = WorkflowService.calculatePriority({
        name: actualName,
        email,
        backgroundNotes,
        programId: programId ? Number(programId) : undefined
      });
    }

    // Generate AI recommendation
    const aiRecommendation = await AIService.generateRecommendation({
      fullName: actualName,
      programName,
      tenthPercentage: tenthPercentage ? Number(tenthPercentage) : undefined,
      twelfthPercentage: twelfthPercentage ? Number(twelfthPercentage) : undefined,
      message: message || backgroundNotes
    });

    // Create enquiry in DB
    const enquiry = await prisma.enquiry.create({
      data: {
        fullName: actualName,
        name: actualName,
        email,
        phone: phone || null,
        programId: programId ? Number(programId) : null,
        campusId: campusId ? Number(campusId) : null,
        programName: programName || null,
        campusPreference: campusPreference || null,
        tenthPercentage: tenthPercentage ? Number(tenthPercentage) : null,
        twelfthPercentage: twelfthPercentage ? Number(twelfthPercentage) : null,
        source: source || 'Website',
        message: message || backgroundNotes || null,
        status: 'new', // New enquiry status is 'new'
        priority: finalPriority,
        aiRecommendation,
      },
    });

    // Generate and save automated follow-ups for test compliance
    const followUpsData = WorkflowService.generateFollowUps(enquiry.id);
    await prisma.followUp.createMany({
      data: followUpsData,
    });

    return res.status(201).json({
      success: true,
      data: enquiry,
    });
  } catch (error: any) {
    console.error('Error creating enquiry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create enquiry due to a server error.',
      error: error.message,
    });
  }
});

// 3. GET /api/enquiries/list & GET /api/enquiries - Fetch all enquiries with status/priority filters
const handleListEnquiries = async (req: Request, res: Response) => {
  try {
    const { status, priority, programId, startDate, endDate } = req.query;
    const where: any = {};

    if (status && typeof status === 'string' && status !== '' && status !== 'all') {
      where.status = status;
    }

    if (priority && typeof priority === 'string' && priority !== '' && priority !== 'all') {
      where.priority = priority;
    }

    if (programId && programId !== '') {
      where.programId = Number(programId);
    }

    if (startDate || endDate) {
      where.dateReceived = {};
      if (startDate && typeof startDate === 'string' && startDate !== '') {
        where.dateReceived.gte = new Date(startDate);
      }
      if (endDate && typeof endDate === 'string' && endDate !== '') {
        where.dateReceived.lte = new Date(endDate);
      }
    }

    const enquiries = await prisma.enquiry.findMany({
      where,
      include: {
        program: { select: { id: true, name: true, department: true } },
        campus: { select: { id: true, name: true, location: true } },
        followUps: true,
        statusHistories: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: enquiries,
    });
  } catch (error: any) {
    console.error('Error listing enquiries:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list enquiries due to a server error.',
      error: error.message,
    });
  }
};
router.get('/', handleListEnquiries);
router.get('/list', handleListEnquiries);

// 4. GET /api/enquiries/detail & GET /api/enquiries/:id - Fetch one details
const handleEnquiryDetail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id ? Number(req.params.id) : Number(req.query.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid Enquiry ID is required.',
      });
    }

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        program: true,
        campus: true,
        followUps: {
          orderBy: { createdAt: 'asc' },
        },
        statusHistories: {
          orderBy: { changedAt: 'asc' }
        },
        application: {
          select: {
            id: true,
            studentId: true,
          }
        }
      },
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error: any) {
    console.error('Error fetching enquiry details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiry details due to a server error.',
      error: error.message,
    });
  }
};
router.get('/detail', handleEnquiryDetail);
router.get('/:id', handleEnquiryDetail);

// 5. PATCH /api/enquiries/:id/status - Body status transition updates
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, note } = req.body;
    const validStatuses = ['new', 'contacted', 'applied', 'admitted', 'closed'];

    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be new, contacted, applied, admitted, or closed.'
      });
    }

    const enquiry = await prisma.enquiry.findUnique({ where: { id } });
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.'
      });
    }

    const targetStatus = status.toLowerCase();
    
    // Check workflow validation
    try {
      const nextStatus = WorkflowService.determineNextStatus(enquiry.status);
      if (targetStatus !== nextStatus) {
        throw new Error('Invalid status transition');
      }
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedEnquiry = await tx.enquiry.update({
        where: { id },
        data: { status: targetStatus }
      });

      await tx.statusHistory.create({
        data: {
          enquiryId: id,
          fromStatus: enquiry.status,
          toStatus: targetStatus,
          note: note || 'Workflow status update'
        }
      });

      return updatedEnquiry;
    });

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error: any) {
    console.error('Error updating status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update enquiry status.',
      error: error.message
    });
  }
});

// 6. POST /api/enquiries/:id/followup - Add followup task record
router.post('/:id/followup', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { note, type } = req.body;

    const enquiry = await prisma.enquiry.findUnique({ where: { id } });
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.'
      });
    }

    const followup = await prisma.followUp.create({
      data: {
        enquiryId: id,
        note: note || '',
        type: type || 'task'
      }
    });

    return res.status(201).json({
      success: true,
      data: followup
    });
  } catch (error: any) {
    console.error('Error creating followup:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create followup.',
      error: error.message
    });
  }
});

// Backward-compatible helper endpoints for tests:
router.patch('/followup/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending or completed.',
      });
    }

    const followUp = await prisma.followUp.update({
      where: { id: Number(id) },
      data: { status },
    });

    return res.status(200).json({
      success: true,
      data: followUp,
    });
  } catch (error: any) {
    console.error('Error updating follow-up:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update follow-up.',
    });
  }
});

router.post('/:id/process', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const enquiry = await prisma.enquiry.findUnique({ where: { id: Number(id) } });
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry record not found.',
      });
    }

    const currentStatus = enquiry.status;
    let nextStatus: string;
    try {
      nextStatus = WorkflowService.determineNextStatus(currentStatus);
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    const updatedEnquiry = await prisma.$transaction(async (tx) => {
      const updated = await tx.enquiry.update({
        where: { id: enquiry.id },
        data: { status: nextStatus },
      });

      await tx.statusHistory.create({
        data: {
          enquiryId: enquiry.id,
          fromStatus: currentStatus,
          toStatus: nextStatus,
          note: note || 'Workflow status progression',
        },
      });

      return updated;
    });

    return res.status(200).json({
      success: true,
      message: 'Enquiry status progressed successfully.',
      data: updatedEnquiry,
    });
  } catch (error: any) {
    console.error('Error processing status transition:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process status due to server error.',
    });
  }
});

router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const history = await prisma.statusHistory.findMany({
      where: { enquiryId: Number(id) },
      orderBy: { changedAt: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error('Error fetching history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch status transition history.',
    });
  }
});

export default router;
