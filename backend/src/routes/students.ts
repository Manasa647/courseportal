import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { validateStudent } from '../middleware/validation';
import { WorkflowService } from '../services/workflowService';
import { calculateFinalGrade } from '../utils/gradeCalculator';

const router = Router();

// POST /create (Handles student creation or enquiry conversion based on baseUrl)
router.post('/create', async (req: Request, res: Response) => {
  try {
    if (req.baseUrl.includes('applications')) {
      // Logic for POST /api/applications/create
      const { enquiryId } = req.body;
      
      if (!enquiryId || isNaN(Number(enquiryId))) {
        return res.status(400).json({
          success: false,
          message: 'Enquiry ID is required and must be an integer.',
        });
      }

      const enquiry = await prisma.enquiry.findUnique({
        where: { id: Number(enquiryId) },
      });

      if (!enquiry) {
        return res.status(404).json({
          success: false,
          message: 'Enquiry record not found.',
        });
      }

      // Split name into first and last name
      const nameParts = enquiry.name.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Enquiry';
      const lastName = nameParts.slice(1).join(' ') || 'Student';

      // Perform transaction to create student, application, and update enquiry status
      const application = await prisma.$transaction(async (tx) => {
        // Find existing student by email or create new
        let student = await tx.student.findUnique({ where: { email: enquiry.email } });
        
        if (!student) {
          student = await tx.student.create({
            data: {
              firstName,
              lastName,
              email: enquiry.email,
              phone: enquiry.phone,
              dateOfBirth: new Date('1990-01-01'), // Default date since dateOfBirth is non-nullable
              campusId: enquiry.campusId,
            },
          });
        }

        // Create the application
        const newApp = await tx.application.create({
          data: {
            enquiryId: enquiry.id,
            studentId: student.id,
            programId: enquiry.programId,
            status: 'submitted',
          },
        });

        // Update the enquiry status
        await tx.enquiry.update({
          where: { id: enquiry.id },
          data: { status: 'applied' },
        });

        return newApp;
      });

      return res.status(201).json({
        success: true,
        message: 'Enquiry successfully converted to Application and Student.',
        data: application,
      });

    } else {
      // Logic for POST /api/students/create
      // First invoke validation logic manually since this router handles dual routes
      return validateStudent(req, res, async () => {
        const { firstName, lastName, email, phone, dateOfBirth, enrollmentDate, campusId, parent } = req.body;

        try {
          const result = await prisma.$transaction(async (tx) => {
            // Check for student email conflict
            const existingStudent = await tx.student.findUnique({ where: { email } });
            if (existingStudent) {
              throw new Error('A student with this email address already exists.');
            }

            const newStudent = await tx.student.create({
              data: {
                firstName,
                lastName,
                email,
                phone: phone || null,
                dateOfBirth: new Date(dateOfBirth),
                enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
                campusId: campusId ? Number(campusId) : null,
              },
            });

            if (parent) {
              await tx.parent.create({
                data: {
                  studentId: newStudent.id,
                  firstName: parent.firstName,
                  lastName: parent.lastName,
                  relationship: parent.relationship,
                  phone: parent.phone,
                  email: parent.email || null,
                },
              });
            }

            return newStudent;
          });

          return res.status(201).json({
            success: true,
            message: 'Student record created successfully.',
            data: result,
          });
        } catch (txErr: any) {
          return res.status(400).json({
            success: false,
            message: txErr.message,
          });
        }
      });
    }
  } catch (error: any) {
    console.error('Error in student/application create handler:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete transaction due to a server error.',
      error: error.message,
    });
  }
});

// GET /list (Student listing with search and filters)
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { campusId, search } = req.query;
    const whereClause: any = {};

    if (campusId && campusId !== '') {
      whereClause.campusId = Number(campusId);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      whereClause.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        parents: true,
        campus: true,
        application: {
          include: {
            program: true,
          },
        },
      },
      orderBy: {
        enrollmentDate: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error: any) {
    console.error('Error listing students:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list students due to a server error.',
      error: error.message,
    });
  }
});

// GET /detail (Fetch full profile including marks, results, attendance counts)
router.get('/detail', async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'A valid Student ID query parameter is required.',
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: {
        parents: true,
        campus: true,
        application: {
          include: {
            program: true,
          },
        },
        feePayments: {
          include: {
            receipt: true,
          },
          orderBy: {
            paymentDate: 'desc',
          },
        },
        attendanceRecords: {
          orderBy: {
            date: 'desc',
          },
        },
        marks: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        results: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // Generate Attendance Summary
    const present = student.attendanceRecords.filter(r => r.status === 'present').length;
    const absent = student.attendanceRecords.filter(r => r.status === 'absent').length;
    const late = student.attendanceRecords.filter(r => r.status === 'late').length;
    const excused = student.attendanceRecords.filter(r => r.status === 'excused').length;

    const attendanceSummary = {
      present,
      absent,
      late,
      excused,
      total: student.attendanceRecords.length,
      attendanceRate: student.attendanceRecords.length > 0 
        ? Math.round(((present + late * 0.5) / student.attendanceRecords.length) * 100) 
        : 100,
    };

    return res.status(200).json({
      success: true,
      data: {
        ...student,
        attendanceSummary,
      },
    });
  } catch (error: any) {
    console.error('Error fetching student details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student details due to a server error.',
      error: error.message,
    });
  }
});

// PATCH /:id/status (Updates Application status)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'A valid Application ID is required.',
      });
    }

    // Map approved to accepted to match DB constraint
    let mappedStatus = status;
    if (status === 'approved') {
      mappedStatus = 'accepted';
    }

    const validStatuses = ['submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'];
    if (!mappedStatus || !validStatuses.includes(mappedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await prisma.application.update({
      where: { id: Number(id) },
      data: { status: mappedStatus },
    });

    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully.',
      data: application,
    });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application status due to a server error.',
      error: error.message,
    });
  }
});

// GET /:id/dropout-risk
router.get('/:id/dropout-risk', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'A valid numeric student ID is required.',
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // 1. Calculate overall attendance percentage
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { studentId: student.id },
    });
    const totalAttendance = attendanceRecords.length;
    const attendancePercentage = totalAttendance > 0
      ? ((attendanceRecords.filter(r => r.status === 'present').length + 
          attendanceRecords.filter(r => r.status === 'late').length * 0.5) / totalAttendance) * 100
      : 100.0;

    // 2. Calculate average marks percentage
    const marks = await prisma.mark.findMany({
      where: { studentId: student.id },
    });
    const averageMarks = marks.length > 0
      ? calculateFinalGrade(marks).percentage
      : 100.0;

    // 3. Calculate fee overdue days
    const pendingPayments = await prisma.feePayment.findMany({
      where: {
        studentId: student.id,
        status: 'pending',
      },
      orderBy: {
        paymentDate: 'asc',
      },
    });

    let feeOverdueDays = 0;
    if (pendingPayments.length > 0) {
      const oldestPaymentDate = new Date(pendingPayments[0].paymentDate);
      const now = new Date();
      if (oldestPaymentDate < now) {
        const diffTime = now.getTime() - oldestPaymentDate.getTime();
        feeOverdueDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    const riskResult = WorkflowService.calculateDropoutRisk({
      attendancePercentage,
      averageMarks,
      feeOverdueDays,
    });

    return res.status(200).json({
      success: true,
      data: {
        studentId: student.id,
        metrics: {
          attendancePercentage,
          averageMarks,
          feeOverdueDays,
        },
        risk: riskResult,
      },
    });
  } catch (error: any) {
    console.error('Error calculating student dropout risk:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute student dropout risk due to a server error.',
      error: error.message,
    });
  }
});

export default router;
