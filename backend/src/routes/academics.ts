import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Student, Course, AttendanceRecord, Mark, Result } from '../models/models';
import { calculateFinalGrade } from '../utils/gradeCalculator';

const router = Router();

// ==========================================
// ATTENDANCE ENDPOINTS
// ==========================================

// POST /mark (Mark attendance)
router.post('/mark', async (req: Request, res: Response) => {
  try {
    const { studentId, courseId, date, status } = req.body;
    const errors: string[] = [];

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      errors.push('studentId is required and must be a valid ObjectId.');
    }
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      errors.push('courseId is required and must be a valid ObjectId.');
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

    const formattedDate = date ? new Date(date) : new Date();
    formattedDate.setHours(0, 0, 0, 0);

    // Verify student and course exist
    const student = await Student.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Check if record exists
    const existing = await AttendanceRecord.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      courseId: new mongoose.Types.ObjectId(courseId),
      date: formattedDate,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An attendance record already exists for this student, course, and date combination.',
      });
    }

    const attendance = await AttendanceRecord.create({
      studentId: new mongoose.Types.ObjectId(studentId),
      courseId: new mongoose.Types.ObjectId(courseId),
      date: formattedDate,
      status,
    });

    const formatted = {
      id: attendance._id.toString(),
      ...attendance.toObject()
    };

    return res.status(201).json({
      success: true,
      message: 'Attendance record registered successfully.',
      data: formatted,
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

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId as string)) {
      return res.status(400).json({ success: false, message: 'Valid studentId is required.' });
    }
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId as string)) {
      return res.status(400).json({ success: false, message: 'Valid courseId is required.' });
    }

    const records = await AttendanceRecord.find({
      studentId: new mongoose.Types.ObjectId(studentId as string),
      courseId: new mongoose.Types.ObjectId(courseId as string),
    }).lean();

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

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      errors.push('studentId is required and must be a valid ObjectId.');
    }
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      errors.push('courseId is required and must be a valid ObjectId.');
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
    const student = await Student.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    if (Number(score) > Number(maxScore)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: ['Score cannot exceed the maximum score.'],
      });
    }

    const mark = await Mark.create({
      studentId: new mongoose.Types.ObjectId(studentId),
      courseId: new mongoose.Types.ObjectId(courseId),
      assessmentName,
      score: Number(score),
      maxScore: Number(maxScore),
      weight: Number(weight),
    });

    const formatted = {
      id: mark._id.toString(),
      ...mark.toObject()
    };

    return res.status(201).json({
      success: true,
      message: 'Mark recorded successfully.',
      data: formatted,
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

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId as string)) {
      return res.status(400).json({ success: false, message: 'Valid studentId is required.' });
    }
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId as string)) {
      return res.status(400).json({ success: false, message: 'Valid courseId is required.' });
    }

    const marks = await Mark.find({
      studentId: new mongoose.Types.ObjectId(studentId as string),
      courseId: new mongoose.Types.ObjectId(courseId as string),
    }).sort({ createdAt: -1 }).lean();

    const summary = calculateFinalGrade(marks as any);

    return res.status(200).json({
      success: true,
      data: {
        marks: marks.map((m: any) => ({ id: m._id.toString(), ...m })),
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

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'studentId is required and must be a valid ObjectId.' });
    }
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'courseId is required and must be a valid ObjectId.' });
    }

    // Fetch marks
    const marks = await Mark.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      courseId: new mongoose.Types.ObjectId(courseId),
    }).lean();

    if (marks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No marks recorded for this student in the specified course. Cannot compute result.',
      });
    }

    const calc = calculateFinalGrade(marks as any);

    const result = await Result.findOneAndUpdate(
      {
        studentId: new mongoose.Types.ObjectId(studentId),
        courseId: new mongoose.Types.ObjectId(courseId),
      },
      {
        grade: calc.grade,
        gpa: calc.gpa,
        status: calc.status,
        remarks: `Auto-computed. Final score: ${calc.percentage}% (from ${marks.length} assessments).`,
      },
      { upsert: true, new: true }
    );

    const formatted = {
      id: result._id.toString(),
      ...result.toObject()
    };

    return res.status(200).json({
      success: true,
      message: 'Course final result computed and saved successfully.',
      data: formatted,
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

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId as string)) {
      return res.status(400).json({
        success: false,
        message: 'A valid studentId query parameter is required.',
      });
    }

    const results = await Result.find({
      studentId: new mongoose.Types.ObjectId(studentId as string),
    }).populate('courseId').sort({ createdAt: 1 }).lean();

    const formattedResults = results.map((r: any) => ({
      id: r._id.toString(),
      ...r,
      course: r.courseId ? { id: r.courseId._id.toString(), ...r.courseId } : null
    }));

    // Calculate Cumulative GPA
    const totalCredits = formattedResults.reduce((sum, r) => sum + (r.course?.credits || 0), 0);
    const weightedGpaSum = formattedResults.reduce((sum, r) => sum + r.gpa * (r.course?.credits || 0), 0);
    const cumulativeGpa = totalCredits > 0 
      ? Math.round((weightedGpaSum / totalCredits) * 100) / 100 
      : 0.0;

    return res.status(200).json({
      success: true,
      data: {
        results: formattedResults,
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
