import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Student, AttendanceRecord, Mark } from '../models/models';
import { AIService } from '../services/aiService';

const router = Router();

// POST /faq
router.post('/faq', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A valid question is required.',
      });
    }

    const qLower = question.toLowerCase();
    let answer = 'Please contact our admissions office at admissions@sgei.ac.in';

    if (qLower.includes('fee')) {
      answer = 'Sri Gowthami Educational Institutions tuition fees range from ₹32,000 to ₹1,25,000 per year depending on the program.';
    } else if (qLower.includes('scholarship')) {
      answer = 'We offer up to 50% merit-based tuition fee waivers and support full SC/ST fee reimbursement. Merit-based scholarships are available for outstanding students.';
    } else if (qLower.includes('hostel')) {
      answer = 'Separate boys and girls hostels are available at Rajahmundry and Peddapuram campuses, costing ₹45,000-₹65,000 per year. Hostel accommodation is well-maintained.';
    } else if (qLower.includes('eligibility')) {
      answer = 'B.Tech requires 60% MPC in Intermediate and EAMCET rank. Other UG courses require 45-50% Intermediate marks. In general, applicants must have a high school diploma or equivalent.';
    } else if (qLower.includes('placement')) {
      answer = 'We have achieved a 94% placement rate with an average package of ₹5.6 LPA and a highest package of ₹28 LPA.';
    } else if (qLower.includes('deadline')) {
      answer = 'The application deadline for the 2026-27 academic year is 31 July 2026.';
    }

    return res.status(200).json({
      success: true,
      data: {
        question,
        answer,
      },
    });
  } catch (error: any) {
    console.error('Error answering FAQ:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process FAQ due to a server error.',
      error: error.message,
    });
  }
});

// POST /recommend-courses
router.post('/recommend-courses', async (req: Request, res: Response) => {
  try {
    const { interests, priorBackground } = req.body;

    if (!interests || typeof interests !== 'string' || interests.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Valid interest details are required.',
      });
    }

    const recommendations = await AIService.recommendCourses(
      interests,
      priorBackground
    );

    return res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error: any) {
    console.error('Error recommending courses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate program recommendations due to a server error.',
      error: error.message,
    });
  }
});

// POST /progress-report
router.post('/progress-report', async (req: Request, res: Response) => {
  try {
    const { studentId, teacherNotes } = req.body;

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid studentId is required.',
      });
    }

    const student = await Student.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    const attendanceRecords = await AttendanceRecord.find({ studentId: student._id }).lean();
    const totalAttendance = attendanceRecords.length;
    const attendancePercentage = totalAttendance > 0
      ? ((attendanceRecords.filter(r => r.status === 'present').length + 
          attendanceRecords.filter(r => r.status === 'late').length * 0.5) / totalAttendance) * 100
      : 100.0;

    const marks = await Mark.find({ studentId: student._id }).populate('courseId').lean();
    const marksBySubject = marks.map((m: any) => ({
      subject: m.courseId?.title || m.courseId?.code || 'Subject',
      score: m.score,
      maxScore: m.maxScore
    }));

    const studentName = `${student.firstName} ${student.lastName}`;

    const report = await AIService.generateProgressReport({
      studentName,
      attendancePercentage,
      marksBySubject,
      teacherNotes
    });

    return res.status(200).json({
      success: true,
      data: { report }
    });
  } catch (error: any) {
    console.error('Error generating progress report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate progress report due to a server error.',
      error: error.message
    });
  }
});

// POST /study-plan
router.post('/study-plan', async (req: Request, res: Response) => {
  try {
    const { programName, weakSubjects, availableHoursPerWeek } = req.body;

    if (!programName || typeof programName !== 'string' || programName.trim() === '') {
      return res.status(400).json({ success: false, message: 'programName is required.' });
    }
    if (!Array.isArray(weakSubjects) || weakSubjects.some(s => typeof s !== 'string')) {
      return res.status(400).json({ success: false, message: 'weakSubjects must be an array of strings.' });
    }
    if (availableHoursPerWeek === undefined || isNaN(Number(availableHoursPerWeek)) || Number(availableHoursPerWeek) <= 0) {
      return res.status(400).json({ success: false, message: 'availableHoursPerWeek must be a positive number.' });
    }

    const plan = await AIService.generateStudyPlan({
      programName,
      weakSubjects,
      availableHoursPerWeek: Number(availableHoursPerWeek),
    });

    return res.status(200).json({
      success: true,
      data: { plan },
    });
  } catch (error: any) {
    console.error('Error generating study plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate study plan due to a server error.',
      error: error.message,
    });
  }
});

// POST /practice-test
router.post('/practice-test', async (req: Request, res: Response) => {
  try {
    const { subject, numQuestions, difficulty } = req.body;

    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      return res.status(400).json({ success: false, message: 'subject is required.' });
    }
    if (numQuestions === undefined || isNaN(Number(numQuestions)) || Number(numQuestions) <= 0) {
      return res.status(400).json({ success: false, message: 'numQuestions must be a positive integer.' });
    }
    if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ success: false, message: "difficulty must be 'easy', 'medium', or 'hard'." });
    }

    const test = await AIService.generatePracticeTest({
      subject,
      numQuestions: Number(numQuestions),
      difficulty,
    });

    return res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error: any) {
    console.error('Error generating practice test:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate practice test due to a server error.',
      error: error.message,
    });
  }
});

// POST /career-guidance
router.post('/career-guidance', async (req: Request, res: Response) => {
  try {
    const { programName, interests } = req.body;

    if (!programName || typeof programName !== 'string' || programName.trim() === '') {
      return res.status(400).json({ success: false, message: 'programName is required.' });
    }

    const guidance = await AIService.careerGuidance({
      programName,
      interests,
    });

    return res.status(200).json({
      success: true,
      data: { guidance },
    });
  } catch (error: any) {
    console.error('Error generating career guidance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate career guidance due to a server error.',
      error: error.message,
    });
  }
});

// POST /explain-doubt
router.post('/explain-doubt', async (req: Request, res: Response) => {
  try {
    const { question, subject, language } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({ success: false, message: 'question is required.' });
    }
    if (!language || !['english', 'telugu'].includes(language)) {
      return res.status(400).json({ success: false, message: "language must be 'english' or 'telugu'." });
    }

    const explanation = await AIService.explainDoubt({
      question,
      subject,
      language
    });

    return res.status(200).json({
      success: true,
      data: { explanation },
    });
  } catch (error: any) {
    console.error('Error explaining doubt:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate explanation due to a server error.',
      error: error.message,
    });
  }
});

export default router;
