import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { calculateFinalGrade } from '../utils/gradeCalculator';

const router = Router();

// ==========================================
// ATTENDANCE ENDPOINTS
// ==========================================

// POST /mark (Mark attendance and prevent duplicates using upsert)
router.post('/mark', async (req: Request, res: Response) => {
  try {
    const { studentId, courseId, date, status } = req.body;
    const errors: string[] = [];

    if (!studentId || isNaN(Number(studentId))) {
      errors.push('studentId is required and must be an integer.');
    }
    if (!courseId || isNaN(Number(courseId))) {
      errors.push('courseId is required and must be an integer.');
    }
    if (!status || !['present', 'absent', 'late', 'excused'].includes(status)) {
      errors.push("status is required and must be one of: 'present', 'absent', 'late', 'excused'.");
    }
    if (date && isNaN(Date.parse(date))) {
      errors.push('date must be a valid date string.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    // Normalize date to midnight (00:00:00) to ensure unique constraint matches consistently
    const formattedDate = date ? new Date(date) : new Date();
    formattedDate.setHours(0, 0, 0, 0);

    // Verify student and course exist
    const student = await prisma.student.findUnique({ where: { id: Number(studentId) } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const course = await prisma.course.findUnique({ where: { id: Number(courseId) } });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Check if record exists
    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        studentId_courseId_date: {
          studentId: Number(studentId),
          courseId: Number(courseId),
          date: formattedDate,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An attendance record already exists for this student, course, and date combination.',
      });
    }

    const attendance = await prisma.attendanceRecord.create({
      data: {
        studentId: Number(studentId),
        courseId: Number(courseId),
        date: formattedDate,
        status,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Attendance record registered successfully.',
      data: attendance,
    });
  } catch (error: any) {
    console.error('Error marking attendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark attendance due to a server error.',
      error: error.message,
    });
  }
});

// GET /summary (Returns student attendance statistics for a course)
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { studentId, courseId } = req.query;

    if (!studentId || isNaN(Number(studentId))) {
      return res.status(400).json({ success: false, message: 'Numeric studentId is required.' });
    }
    if (!courseId || isNaN(Number(courseId))) {
      return res.status(400).json({ success: false, message: 'Numeric courseId is required.' });
    }

    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId: Number(studentId),
        courseId: Number(courseId),
      },
    });

    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const excused = records.filter((r) => r.status === 'excused').length;

    const total = records.length;
    const attendancePercentage = total > 0 
      ? Math.round(((present + late * 0.5) / total) * 100 * 10) / 10
      : 100.0;

    return res.status(200).json({
      success: true,
      data: {
        present,
        presentCount: present,
        absent,
        late,
        excused,
        total,
        totalClasses: total,
        attendancePercentage,
      },
    });
  } catch (error: any) {
    console.error('Error calculating attendance summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance summary.',
      error: error.message,
    });
  }
});

// ==========================================
// MARKS ENDPOINTS
// ==========================================

// POST /record (Add a Mark entry)
router.post('/record', async (req: Request, res: Response) => {
  try {
    const { studentId, courseId, assessmentName, score, maxScore, weight } = req.body;
    const errors: string[] = [];

    if (!studentId || isNaN(Number(studentId))) {
      errors.push('studentId is required and must be an integer.');
    }
    if (!courseId || isNaN(Number(courseId))) {
      errors.push('courseId is required and must be an integer.');
    }
    if (!assessmentName || typeof assessmentName !== 'string' || assessmentName.trim() === '') {
      errors.push('assessmentName is required and must be a string.');
    }
    if (score === undefined || isNaN(Number(score)) || Number(score) < 0) {
      errors.push('score is required and must be a non-negative number.');
    }
    if (!maxScore || isNaN(Number(maxScore)) || Number(maxScore) <= 0) {
      errors.push('maxScore is required and must be a positive number.');
    }
    if (weight === undefined || isNaN(Number(weight)) || Number(weight) <= 0 || Number(weight) > 1.0) {
      errors.push('weight is required and must be a decimal between 0 and 1.0.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    // Verify student and course
    const student = await prisma.student.findUnique({ where: { id: Number(studentId) } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const course = await prisma.course.findUnique({ where: { id: Number(courseId) } });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Enforce score <= maxScore check
    if (Number(score) > Number(maxScore)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: ['Score cannot exceed the maximum score.'],
      });
    }

    const mark = await prisma.mark.create({
      data: {
        studentId: Number(studentId),
        courseId: Number(courseId),
        assessmentName,
        score: Number(score),
        maxScore: Number(maxScore),
        weight: Number(weight),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Mark recorded successfully.',
      data: mark,
    });
  } catch (error: any) {
    console.error('Error recording mark:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record mark due to a server error.',
      error: error.message,
    });
  }
});

// GET /list (List marks and compute weighted average)
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { studentId, courseId } = req.query;

    if (!studentId || isNaN(Number(studentId))) {
      return res.status(400).json({ success: false, message: 'Numeric studentId is required.' });
    }
    if (!courseId || isNaN(Number(courseId))) {
      return res.status(400).json({ success: false, message: 'Numeric courseId is required.' });
    }

    const marks = await prisma.mark.findMany({
      where: {
        studentId: Number(studentId),
        courseId: Number(courseId),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const summary = calculateFinalGrade(marks);

    return res.status(200).json({
      success: true,
      data: {
        marks,
        weightedAveragePercentage: summary.percentage,
        projectedGrade: summary.grade,
        projectedGpa: summary.gpa,
      },
    });
  } catch (error: any) {
    console.error('Error listing marks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list marks due to a server error.',
      error: error.message,
    });
  }
});

// ==========================================
// RESULTS ENDPOINTS
// ==========================================

// POST /compute (Compute final grade, GPA, and upsert Result row)
router.post('/compute', async (req: Request, res: Response) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || isNaN(Number(studentId))) {
      return res.status(400).json({ success: false, message: 'studentId is required and must be an integer.' });
    }
    if (!courseId || isNaN(Number(courseId))) {
      return res.status(400).json({ success: false, message: 'courseId is required and must be an integer.' });
    }

    // Fetch marks
    const marks = await prisma.mark.findMany({
      where: {
        studentId: Number(studentId),
        courseId: Number(courseId),
      },
    });

    if (marks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No marks recorded for this student in the specified course. Cannot compute result.',
      });
    }

    // Run grading calculation logic
    const calc = calculateFinalGrade(marks);

    // Upsert Result record
    const result = await prisma.result.upsert({
      where: {
        studentId_courseId: {
          studentId: Number(studentId),
          courseId: Number(courseId),
        },
      },
      update: {
        grade: calc.grade,
        gpa: calc.gpa,
        status: calc.status,
        remarks: `Auto-computed. Final score: ${calc.percentage}% (from ${marks.length} assessments).`,
      },
      create: {
        studentId: Number(studentId),
        courseId: Number(courseId),
        grade: calc.grade,
        gpa: calc.gpa,
        status: calc.status,
        remarks: `Auto-computed. Final score: ${calc.percentage}% (from ${marks.length} assessments).`,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Course final result computed and saved successfully.',
      data: result,
    });
  } catch (error: any) {
    console.error('Error computing course result:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute result due to a server error.',
      error: error.message,
    });
  }
});

// GET /transcript (Returns all course Results for a student)
router.get('/transcript', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;

    if (!studentId || isNaN(Number(studentId))) {
      return res.status(400).json({
        success: false,
        message: 'A numeric studentId query parameter is required.',
      });
    }

    const results = await prisma.result.findMany({
      where: {
        studentId: Number(studentId),
      },
      include: {
        course: {
          select: {
            code: true,
            title: true,
            credits: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate Cumulative GPA
    const totalCredits = results.reduce((sum, r) => sum + r.course.credits, 0);
    const weightedGpaSum = results.reduce((sum, r) => sum + r.gpa * r.course.credits, 0);
    const cumulativeGpa = totalCredits > 0 
      ? Math.round((weightedGpaSum / totalCredits) * 100) / 100 
      : 0.0;

    return res.status(200).json({
      success: true,
      data: {
        results,
        cumulativeGpa,
        totalCreditsAttempted: totalCredits,
      },
    });
  } catch (error: any) {
    console.error('Error fetching academic transcript:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transcript due to a server error.',
      error: error.message,
    });
  }
});

export default router;
