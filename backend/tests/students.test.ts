import request from 'supertest';
import { app, server } from '../src/server';
import prisma from '../src/config/db';

describe('Course & Program Portal - Students & Applications Integration Tests', () => {
  let campusId: number;
  let programId: number;
  let courseId: number;
  let studentId: number;
  let enquiryId: number;
  let applicationId: number;

  beforeAll(async () => {
    // Clear student and application tables
    await prisma.followUp.deleteMany({});
    await prisma.enquiry.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.result.deleteMany({});
    await prisma.mark.deleteMany({});
    await prisma.attendanceRecord.deleteMany({});
    await prisma.receipt.deleteMany({});
    await prisma.feePayment.deleteMany({});
    await prisma.parent.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.program.deleteMany({});
    await prisma.campus.deleteMany({});

    // Seed campus & program
    const campus = await prisma.campus.create({
      data: {
        name: 'Test Boston Campus',
        location: 'Boston',
        address: '100 Main St',
      },
    });
    campusId = campus.id;

    const program = await prisma.program.create({
      data: {
        name: 'Test Computer Science',
        description: 'CS program',
        department: 'Computing',
      },
    });
    programId = program.id;

    const course = await prisma.course.create({
      data: {
        programId: program.id,
        code: 'TEST-101',
        title: 'Test Core Course',
        credits: 3,
      },
    });
    courseId = course.id;

    // Seed an Enquiry to test conversion
    const enquiry = await prisma.enquiry.create({
      data: {
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        phone: '1234567',
        programId,
        campusId,
        source: 'Website',
      },
    });
    enquiryId = enquiry.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe('POST /api/students/create', () => {
    it('should fail with 400 Bad Request when required fields are missing or invalid', async () => {
      const response = await request(app)
        .post('/api/students/create')
        .send({
          email: 'invalid-email',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('First name is required and must be a valid string.');
      expect(response.body.errors).toContain('Last name is required and must be a valid string.');
      expect(response.body.errors).toContain('Email is required and must be a valid email address.');
      expect(response.body.errors).toContain('Date of birth is required and must be a valid date.');
    });

    it('should create a Student with nested Parent successfully', async () => {
      const response = await request(app)
        .post('/api/students/create')
        .send({
          firstName: 'Robert',
          lastName: 'Smith',
          email: 'robert.smith@example.com',
          phone: '98765432',
          dateOfBirth: '2005-05-15',
          campusId,
          parent: {
            firstName: 'Sarah',
            lastName: 'Smith',
            relationship: 'Mother',
            phone: '11223344',
            email: 'sarah.smith@example.com',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      studentId = response.body.data.id;

      // Verify DB
      const dbStudent = await prisma.student.findUnique({
        where: { id: studentId },
        include: { parents: true },
      });
      expect(dbStudent).not.toBeNull();
      expect(dbStudent!.firstName).toBe('Robert');
      expect(dbStudent!.parents.length).toBe(1);
      expect(dbStudent!.parents[0].firstName).toBe('Sarah');
    });

    it('should fail if student email already exists', async () => {
      const response = await request(app)
        .post('/api/students/create')
        .send({
          firstName: 'Robert2',
          lastName: 'Smith2',
          email: 'robert.smith@example.com', // Duplicate email
          dateOfBirth: '2005-05-15',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/students/list', () => {
    it('should return a list of students matching filter and search', async () => {
      const response = await request(app)
        .get(`/api/students/list?campusId=${campusId}&search=Robert`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].firstName).toBe('Robert');
      expect(response.body.data[0].parents.length).toBe(1);
    });

    it('should return empty list when no matches found', async () => {
      const response = await request(app)
        .get(`/api/students/list?search=NonExistent`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /api/students/detail', () => {
    beforeAll(async () => {
      // Add mock data for the student profile (payments, attendance, marks, results)
      const payment = await prisma.feePayment.create({
        data: {
          studentId,
          amount: 500.0,
          paymentMethod: 'Credit Card',
          status: 'completed',
        },
      });

      await prisma.receipt.create({
        data: {
          paymentId: payment.id,
          receiptNumber: 'REC-12345',
        },
      });

      await prisma.attendanceRecord.createMany({
        data: [
          { studentId, courseId, date: new Date('2026-06-10'), status: 'present' },
          { studentId, courseId, date: new Date('2026-06-11'), status: 'present' },
          { studentId, courseId, date: new Date('2026-06-12'), status: 'absent' },
        ],
      });

      await prisma.mark.create({
        data: {
          studentId,
          courseId,
          assessmentName: 'Midterm Exam',
          score: 85,
          maxScore: 100,
          weight: 0.3,
        },
      });

      await prisma.result.create({
        data: {
          studentId,
          courseId,
          grade: 'A',
          gpa: 4.0,
          status: 'pass',
        },
      });
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/students/detail?id=invalid');

      expect(response.status).toBe(400);
    });

    it('should return 404 if student not found', async () => {
      const response = await request(app)
        .get('/api/students/detail?id=9999');

      expect(response.status).toBe(404);
    });

    it('should return complete student profile details and summaries', async () => {
      const response = await request(app)
        .get(`/api/students/detail?id=${studentId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Robert');
      expect(response.body.data.parents.length).toBe(1);
      expect(response.body.data.feePayments.length).toBe(1);
      expect(response.body.data.feePayments[0].receipt.receiptNumber).toBe('REC-12345');
      expect(response.body.data.attendanceRecords.length).toBe(3);
      expect(response.body.data.attendanceSummary).toEqual({
        present: 2,
        absent: 1,
        late: 0,
        excused: 0,
        total: 3,
        attendanceRate: 67,
      });
      expect(response.body.data.marks.length).toBe(1);
      expect(response.body.data.results.length).toBe(1);
    });
  });

  describe('POST /api/applications/create', () => {
    it('should fail if enquiryId not found', async () => {
      const response = await request(app)
        .post('/api/applications/create')
        .send({ enquiryId: 9999 });

      expect(response.status).toBe(404);
    });

    it('should convert enquiry into application and student', async () => {
      const response = await request(app)
        .post('/api/applications/create')
        .send({ enquiryId: enquiryId });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      applicationId = response.body.data.id;

      // Verify Enquiry status updated
      const dbEnquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } });
      expect(dbEnquiry!.status).toBe('applied');

      // Verify Student created
      const dbStudent = await prisma.student.findUnique({ where: { email: 'alex.johnson@example.com' } });
      expect(dbStudent).not.toBeNull();
      expect(dbStudent!.firstName).toBe('Alex');
      expect(dbStudent!.lastName).toBe('Johnson');
    });
  });

  describe('PATCH /api/applications/:id/status', () => {
    it('should fail with 400 for invalid status', async () => {
      const response = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .send({ status: 'invalid-status' });

      expect(response.status).toBe(400);
    });

    it('should successfully update application status', async () => {
      const response = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .send({ status: 'approved' }); // Map approved to accepted

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');

      const dbApp = await prisma.application.findUnique({ where: { id: applicationId } });
      expect(dbApp!.status).toBe('accepted');
    });
  });
});
