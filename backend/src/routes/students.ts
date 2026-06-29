import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Student, Parent, Campus, Application, Enquiry, FeePayment, AttendanceRecord, Mark, Result, Program } from '../models/models';
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
      
      if (!enquiryId || !mongoose.Types.ObjectId.isValid(enquiryId)) {
        return res.status(400).json({
          success: false,
          message: 'Enquiry ID is required and must be a valid ObjectId.',
        });
      }

      const enquiry = await Enquiry.findById(enquiryId).lean();
      if (!enquiry) {
        return res.status(404).json({
          success: false,
          message: 'Enquiry record not found.',
        });
      }

      // Split name into first and last name
      const nameParts = (enquiry.name || '').trim().split(/\s+/);
      const firstName = nameParts[0] || 'Enquiry';
      const lastName = nameParts.slice(1).join(' ') || 'Student';

      // Find existing student by email or create new
      let student = await Student.findOne({ email: enquiry.email });
      if (!student) {
        student = await Student.create({
          firstName,
          lastName,
          email: enquiry.email,
          phone: enquiry.phone,
          dateOfBirth: new Date('1990-01-01'),
          campusId: enquiry.campusId || null,
        });
      }

      // Create the application
      const newApp = await Application.create({
        enquiryId: enquiry._id,
        studentId: student._id,
        programId: enquiry.programId || null,
        status: 'submitted',
      });

      // Update the enquiry status
      await Enquiry.findByIdAndUpdate(enquiry._id, { status: 'applied' });

      const formatted = {
        id: newApp._id.toString(),
        ...newApp.toObject()
      };

      return res.status(201).json({
        success: true,
        message: 'Enquiry successfully converted to Application and Student.',
        data: formatted,
      });

    } else {
      // Logic for POST /api/students/create
      return validateStudent(req, res, async () => {
        const { firstName, lastName, email, phone, dateOfBirth, enrollmentDate, campusId, parent } = req.body;

        try {
          const existingStudent = await Student.findOne({ email });
          if (existingStudent) {
            return res.status(400).json({
              success: false,
              message: 'A student with this email address already exists.',
            });
          }

          const cleanCampusId = (campusId && mongoose.Types.ObjectId.isValid(campusId)) ? new mongoose.Types.ObjectId(campusId) : undefined;

          const newStudent = await Student.create({
            firstName,
            lastName,
            email,
            phone: phone || null,
            dateOfBirth: new Date(dateOfBirth),
            enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
            campusId: cleanCampusId,
          });

          if (parent) {
            await Parent.create({
              studentId: newStudent._id,
              firstName: parent.firstName,
              lastName: parent.lastName,
              relationship: parent.relationship,
              phone: parent.phone,
              email: parent.email || null,
            });
          }

          const formatted = {
            id: newStudent._id.toString(),
            ...newStudent.toObject()
          };

          return res.status(201).json({
            success: true,
            message: 'Student record created successfully.',
            data: formatted,
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

    if (campusId && campusId !== '' && mongoose.Types.ObjectId.isValid(campusId as string)) {
      whereClause.campusId = new mongoose.Types.ObjectId(campusId as string);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search, 'i');
      whereClause.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    const students = await Student.find(whereClause)
      .sort({ enrollmentDate: -1 })
      .lean();

    const formatted = await Promise.all(students.map(async (s: any) => {
      const parents = await Parent.find({ studentId: s._id }).lean();
      const campus = s.campusId ? await Campus.findById(s.campusId).lean() : null;
      const application = await Application.findOne({ studentId: s._id }).populate('programId').lean();

      return {
        id: s._id.toString(),
        ...s,
        parents: parents.map((p: any) => ({ id: p._id.toString(), ...p })),
        campus: campus ? { id: campus._id.toString(), ...campus } : null,
        application: application ? {
          id: application._id.toString(),
          ...application,
          program: application.programId ? { id: application.programId._id.toString(), ...application.programId } : null
        } : null
      };
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
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

    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: 'A valid Student ID query parameter is required.',
      });
    }

    const student: any = await Student.findById(id).lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // Load sub-details
    const parents = await Parent.find({ studentId: student._id }).lean();
    const campus = student.campusId ? await Campus.findById(student.campusId).lean() : null;
    const application = await Application.findOne({ studentId: student._id }).populate('programId').lean();
    const feePayments = await FeePayment.find({ studentId: student._id }).sort({ paymentDate: -1 }).lean();
    
    const formattedPayments = await Promise.all(feePayments.map(async (f: any) => {
      const receipt = await mongoose.model('Receipt').findOne({ paymentId: f._id }).lean() as any;
      return {
        id: f._id.toString(),
        ...f,
        receipt: receipt ? { id: receipt._id.toString(), ...receipt } : null
      };
    }));

    const attendanceRecords = await AttendanceRecord.find({ studentId: student._id }).sort({ date: -1 }).lean();
    const marks = await Mark.find({ studentId: student._id }).sort({ createdAt: -1 }).lean();
    const results = await Result.find({ studentId: student._id }).sort({ createdAt: -1 }).lean();

    // Generate Attendance Summary
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const excused = attendanceRecords.filter(r => r.status === 'excused').length;

    const attendanceSummary = {
      present,
      absent,
      late,
      excused,
      total: attendanceRecords.length,
      attendanceRate: attendanceRecords.length > 0 
        ? Math.round(((present + late * 0.5) / attendanceRecords.length) * 100) 
        : 100,
    };

    return res.status(200).json({
      success: true,
      data: {
        id: student._id.toString(),
        ...student,
        parents: parents.map((p: any) => ({ id: p._id.toString(), ...p })),
        campus: campus ? { id: campus._id.toString(), ...campus } : null,
        application: application ? {
          id: application._id.toString(),
          ...application,
          program: application.programId ? { id: application.programId._id.toString(), ...application.programId } : null
        } : null,
        feePayments: formattedPayments,
        attendanceRecords: attendanceRecords.map((r: any) => ({ id: r._id.toString(), ...r })),
        marks: marks.map((m: any) => ({ id: m._id.toString(), ...m })),
        results: results.map((r: any) => ({ id: r._id.toString(), ...r })),
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

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid Application ID is required.',
      });
    }

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

    const application = await Application.findByIdAndUpdate(
      id,
      { status: mappedStatus },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const formatted = {
      id: application._id.toString(),
      ...application.toObject()
    };

    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully.',
      data: formatted,
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

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid student ID is required.',
      });
    }

    const student = await Student.findById(id).lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // 1. Calculate overall attendance percentage
    const attendanceRecords = await AttendanceRecord.find({ studentId: student._id }).lean();
    const totalAttendance = attendanceRecords.length;
    const attendancePercentage = totalAttendance > 0
      ? ((attendanceRecords.filter(r => r.status === 'present').length + 
          attendanceRecords.filter(r => r.status === 'late').length * 0.5) / totalAttendance) * 100
      : 100.0;

    // 2. Calculate average marks percentage
    const marks = await Mark.find({ studentId: student._id }).lean();
    const averageMarks = marks.length > 0
      ? calculateFinalGrade(marks as any).percentage
      : 100.0;

    // 3. Calculate fee overdue days
    const pendingPayments = await FeePayment.find({
      studentId: student._id,
      status: 'pending',
    }).sort({ paymentDate: 1 }).lean();

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
        studentId: student._id.toString(),
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
