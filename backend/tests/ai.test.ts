import request from 'supertest';
import { app, server } from '../src/server';
import prisma from '../src/config/db';

describe('Course & Program Portal - AI Services Fallback Integration Tests', () => {
  let campusId: number;
  let programId: number;
  let studentId: number;

  beforeAll(async () => {
    // Clear relevant tables
    await prisma.followUp.deleteMany({});
    await prisma.enquiry.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.result.deleteMany({});
    await prisma.mark.deleteMany({});
    await prisma.attendanceRecord.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.program.deleteMany({});
    await prisma.campus.deleteMany({});

    // Seed dummy campus and program
    const campus = await prisma.campus.create({
      data: {
        name: 'Test Campus',
        location: 'Test City',
        address: '123 Test St',
      },
    });
    campusId = campus.id;

    const program = await prisma.program.create({
      data: {
        name: 'Computer Science',
        description: 'Undergraduate degree program in software development.',
        department: 'School of Computing',
      },
    });
    programId = program.id;

    // Seed dummy course
    const course = await prisma.course.create({
      data: {
        programId: program.id,
        code: 'CS-101',
        title: 'Introduction to Programming',
        credits: 4,
      },
    });

    // Seed dummy student
    const student = await prisma.student.create({
      data: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '12345678',
        dateOfBirth: new Date('2000-01-01'),
        campusId,
      },
    });
    studentId = student.id;

    // Seed student attendance & marks
    await prisma.attendanceRecord.create({
      data: {
        studentId,
        courseId: course.id,
        date: new Date(),
        status: 'present',
      },
    });

    await prisma.mark.create({
      data: {
        studentId,
        courseId: course.id,
        assessmentName: 'Midterm Exam',
        score: 85,
        maxScore: 100,
        weight: 1.0,
      },
    });

    // Make sure GEMINI_API_KEY is not defined or is cleared for this test block
    delete process.env.GEMINI_API_KEY;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe('POST /api/ai/faq', () => {
    it('should return 400 when question is missing', async () => {
      const response = await request(app)
        .post('/api/ai/faq')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return canned fallback answer for fee question', async () => {
      const response = await request(app)
        .post('/api/ai/faq')
        .send({ question: 'How much is the fee?', programId });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.answer.toLowerCase()).toContain('tuition fees');
    });

    it('should return canned fallback answer for eligibility question', async () => {
      const response = await request(app)
        .post('/api/ai/faq')
        .send({ question: 'What is the eligibility criteria?', programId });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.answer.toLowerCase()).toContain('high school diploma');
    });

    it('should return canned fallback answer for hostel question', async () => {
      const response = await request(app)
        .post('/api/ai/faq')
        .send({ question: 'Do you have hostel facilities?', programId });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.answer.toLowerCase()).toContain('hostel accommodation');
    });

    it('should return canned fallback answer for scholarship question', async () => {
      const response = await request(app)
        .post('/api/ai/faq')
        .send({ question: 'Are there any scholarships?', programId });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.answer.toLowerCase()).toContain('scholarships');
    });

    it('should return default contact message for other questions', async () => {
      const response = await request(app)
        .post('/api/ai/faq')
        .send({ question: 'Who is the principal?', programId });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.answer).toBe('Please contact our admissions office at admissions@sgei.ac.in');
    });
  });

  describe('POST /api/ai/recommend-courses', () => {
    it('should return 400 when interests are missing', async () => {
      const response = await request(app)
        .post('/api/ai/recommend-courses')
        .send({});
      expect(response.status).toBe(400);
    });

    it('should return recommended programs using local keyword scoring', async () => {
      const response = await request(app)
        .post('/api/ai/recommend-courses')
        .send({ interests: 'computer science program', priorBackground: 'high school' });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0].programName).toBe('Computer Science');
      expect(response.body.data[0].matchReason).toBe('Matched based on your stated interests');
      expect(response.body.data[0].matchScore).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/ai/progress-report', () => {
    it('should return 400 when studentId is missing', async () => {
      const response = await request(app)
        .post('/api/ai/progress-report')
        .send({});
      expect(response.status).toBe(400);
    });

    it('should generate templated progress report from database records', async () => {
      const response = await request(app)
        .post('/api/ai/progress-report')
        .send({ studentId, teacherNotes: 'Keep up the good work!' });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.report).toContain('Jane Doe');
      expect(response.body.data.report).toContain('Introduction to Programming');
      expect(response.body.data.report).toContain('85/100');
    });
  });

  describe('POST /api/ai/study-plan', () => {
    it('should generate a simple divide-evenly weekly table as fallback', async () => {
      const response = await request(app)
        .post('/api/ai/study-plan')
        .send({
          programName: 'Computer Science',
          weakSubjects: ['Programming', 'Algorithms'],
          availableHoursPerWeek: 10,
        });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.data.plan).toBe('string');
      expect(response.body.data.plan.length).toBeGreaterThan(0);
      expect(response.body.data.plan).toContain('Programming');
      expect(response.body.data.plan).toContain('Algorithms');
    });
  });

  describe('POST /api/ai/practice-test', () => {
    it('should return hardcoded placeholder questions when key is unset', async () => {
      const numQuestions = 3;
      const response = await request(app)
        .post('/api/ai/practice-test')
        .send({
          subject: 'Computer Science',
          numQuestions,
          difficulty: 'medium',
        });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(numQuestions);
      for (let i = 0; i < numQuestions; i++) {
        expect(response.body.data[i]).toHaveProperty('question');
        expect(typeof response.body.data[i].question).toBe('string');
        
        expect(response.body.data[i]).toHaveProperty('options');
        expect(response.body.data[i].options).toBeInstanceOf(Array);
        expect(response.body.data[i].options.length).toBe(4);
        
        expect(response.body.data[i]).toHaveProperty('correctAnswerIndex');
        expect(typeof response.body.data[i].correctAnswerIndex).toBe('number');
      }
    });
  });

  describe('POST /api/ai/career-guidance', () => {
    it('should return hardcoded career advice matching program', async () => {
      const response = await request(app)
        .post('/api/ai/career-guidance')
        .send({
          programName: 'Computer Science',
          interests: 'ai engineering',
        });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.guidance).toContain('Software Developer');
    });
  });

  describe('POST /api/ai/explain-doubt', () => {
    it('should return English explanation and disclaimer if Telugu requested without API key', async () => {
      const response = await request(app)
        .post('/api/ai/explain-doubt')
        .send({
          question: 'What is a binary tree?',
          subject: 'Data Structures',
          language: 'telugu',
        });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.explanation).toContain('requires the Gemini AI service');
    });
  });
});
