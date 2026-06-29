import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Student, FeePayment, Receipt, Campus, Application, Program } from '../models/models';

const router = Router();

// POST /api/fees/create-payment (Atomic transaction to record payment and issue receipt)
router.post('/create-payment', async (req: Request, res: Response) => {
  try {
    const { studentId, amount, paymentMethod } = req.body;
    const errors: string[] = [];

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      errors.push('studentId is required and must be a valid ObjectId.');
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
    const student = await Student.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // Create payment
    const payment = await FeePayment.create({
      studentId: new mongoose.Types.ObjectId(studentId),
      amount: Number(amount),
      paymentMethod,
      status: 'completed',
    });

    // Generate unique receipt number
    const receiptNumber = `REC-${Date.now()}-${studentId}`;

    // Create linked Receipt
    const receipt = await Receipt.create({
      paymentId: payment._id,
      receiptNumber,
      pdfUrl: `/receipts/${receiptNumber}.pdf`,
    });

    const result = {
      payment: { id: payment._id.toString(), ...payment.toObject() },
      receipt: { id: receipt._id.toString(), ...receipt.toObject() }
    };

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

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId as string)) {
      return res.status(400).json({
        success: false,
        message: 'A valid studentId query parameter is required.',
      });
    }

    const payments = await FeePayment.find({
      studentId: new mongoose.Types.ObjectId(studentId as string),
    }).sort({ paymentDate: -1 }).lean();

    const formattedPayments = await Promise.all(payments.map(async (p: any) => {
      const receipt = await Receipt.findOne({ paymentId: p._id }).lean();
      return {
        id: p._id.toString(),
        ...p,
        receipt: receipt ? { id: receipt._id.toString(), ...receipt } : null
      };
    }));

    const runningTotal = formattedPayments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    return res.status(200).json({
      success: true,
      data: {
        payments: formattedPayments,
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

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid Receipt ID is required.',
      });
    }

    const receipt: any = await Receipt.findById(id).lean();
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found.',
      });
    }

    // Resolve payment and student joins
    const payment: any = await FeePayment.findById(receipt.paymentId).lean();
    let formattedPayment = null;
    if (payment) {
      const student: any = await Student.findById(payment.studentId).lean();
      let formattedStudent = null;
      if (student) {
        const campus = student.campusId ? await Campus.findById(student.campusId).lean() : null;
        formattedStudent = {
          id: student._id.toString(),
          ...student,
          campus: campus ? { id: campus._id.toString(), ...campus } : null
        };
      }
      formattedPayment = {
        id: payment._id.toString(),
        ...payment,
        student: formattedStudent
      };
    }

    const formatted = {
      id: receipt._id.toString(),
      ...receipt,
      payment: formattedPayment
    };

    return res.status(200).json({
      success: true,
      data: formatted,
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
    const payments = await FeePayment.find({ status: 'completed' }).lean();

    const formattedPayments = await Promise.all(payments.map(async (p: any) => {
      const student: any = await Student.findById(p.studentId).lean();
      let formattedStudent = null;
      if (student) {
        const campus = student.campusId ? await Campus.findById(student.campusId).lean() : null;
        const application: any = await Application.findOne({ studentId: student._id }).lean();
        let formattedApplication = null;
        if (application) {
          const program = application.programId ? await Program.findById(application.programId).lean() : null;
          formattedApplication = {
            id: application._id.toString(),
            ...application,
            program: program ? { id: program._id.toString(), ...program } : null
          };
        }
        formattedStudent = {
          id: student._id.toString(),
          ...student,
          campus: campus ? { id: campus._id.toString(), ...campus } : null,
          application: formattedApplication
        };
      }
      return {
        id: p._id.toString(),
        ...p,
        student: formattedStudent
      };
    }));

    // Compute month collected
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthPayments = formattedPayments.filter(
      (p) => new Date(p.paymentDate) >= startOfMonth
    );
    const totalCollectedThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Grouping by program
    const byProgram: Record<string, number> = {};
    formattedPayments.forEach((p) => {
      const progName = p.student?.application?.program?.name || 'Unassigned / General';
      byProgram[progName] = (byProgram[progName] || 0) + p.amount;
    });

    // Grouping by campus
    const byCampus: Record<string, number> = {};
    formattedPayments.forEach((p) => {
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
