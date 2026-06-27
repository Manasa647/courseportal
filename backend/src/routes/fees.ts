import { Router, Request, Response } from 'express';
import prisma from '../config/db';

const router = Router();

// POST /api/fees/create-payment (Atomic transaction to record payment and issue receipt)
router.post('/create-payment', async (req: Request, res: Response) => {
  try {
    const { studentId, amount, paymentMethod } = req.body;
    const errors: string[] = [];

    if (!studentId || isNaN(Number(studentId))) {
      errors.push('studentId is required and must be an integer.');
    }
    if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      errors.push('amount is required and must be a positive number.');
    }
    if (!paymentMethod || typeof paymentMethod !== 'string' || paymentMethod.trim() === '') {
      errors.push('paymentMethod is required and must be a string.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    // Check student existence
    const student = await prisma.student.findUnique({
      where: { id: Number(studentId) },
    });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // Atomic transaction for FeePayment + Receipt creation
    const result = await prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.feePayment.create({
        data: {
          studentId: Number(studentId),
          amount: Number(amount),
          paymentMethod,
          status: 'completed',
        },
      });

      // Generate unique receipt number
      const receiptNumber = `REC-${Date.now()}-${studentId}`;

      // Create linked Receipt
      const receipt = await tx.receipt.create({
        data: {
          paymentId: payment.id,
          receiptNumber,
          pdfUrl: `/receipts/${receiptNumber}.pdf`,
        },
      });

      return { payment, receipt };
    });

    return res.status(201).json({
      success: true,
      message: 'Fee payment recorded and receipt issued successfully.',
      data: result,
    });
  } catch (error: any) {
    console.error('Error recording fee payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record payment due to a server error.',
      error: error.message,
    });
  }
});

// GET /api/fees/list?studentId= (List all payments for a student with running total)
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;

    if (!studentId || isNaN(Number(studentId))) {
      return res.status(400).json({
        success: false,
        message: 'A numeric studentId query parameter is required.',
      });
    }

    const payments = await prisma.feePayment.findMany({
      where: {
        studentId: Number(studentId),
      },
      include: {
        receipt: true,
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });

    const runningTotal = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    return res.status(200).json({
      success: true,
      data: {
        payments,
        runningTotal,
      },
    });
  } catch (error: any) {
    console.error('Error listing student fee payments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list payments due to a server error.',
      error: error.message,
    });
  }
});

// GET /api/fees/receipt/:id (Fetch single receipt with student & payment joins)
router.get('/receipt/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'A valid numeric Receipt ID is required.',
      });
    }

    const receipt = await prisma.receipt.findUnique({
      where: { id: Number(id) },
      include: {
        payment: {
          include: {
            student: {
              include: {
                campus: true,
              },
            },
          },
        },
      },
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: receipt,
    });
  } catch (error: any) {
    console.error('Error fetching receipt details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch receipt details due to a server error.',
      error: error.message,
    });
  }
});

// GET /api/fees/summary (Dashboard summary collected this month, by program, by campus)
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const payments = await prisma.feePayment.findMany({
      where: {
        status: 'completed',
      },
      include: {
        student: {
          include: {
            campus: true,
            application: {
              include: {
                program: true,
              },
            },
          },
        },
      },
    });

    // Compute month collected
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthPayments = payments.filter(
      (p) => new Date(p.paymentDate) >= startOfMonth
    );
    const totalCollectedThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Grouping by program
    const byProgram: Record<string, number> = {};
    payments.forEach((p) => {
      const progName = p.student?.application?.program?.name || 'Unassigned / General';
      byProgram[progName] = (byProgram[progName] || 0) + p.amount;
    });

    // Grouping by campus
    const byCampus: Record<string, number> = {};
    payments.forEach((p) => {
      const campusName = p.student?.campus?.name || 'Unassigned Campus';
      byCampus[campusName] = (byCampus[campusName] || 0) + p.amount;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalCollectedThisMonth,
        byProgram,
        byCampus,
      },
    });
  } catch (error: any) {
    console.error('Error generating fees summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate fees summary due to a server error.',
      error: error.message,
    });
  }
});

export default router;
