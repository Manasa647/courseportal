import request from 'supertest';
import { app, server } from '../src/server';
import prisma from '../src/config/db';

describe('Sri Gowthami API Integration Tests', () => {
  let programId = 1;
  let campusId = 1;
  let createdEnquiryId: number;

  beforeAll(async () => {
    // Clean database before starting
    await prisma.followUp.deleteMany({});
    await prisma.statusHistory.deleteMany({});
    await prisma.enquiry.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.program.deleteMany({});
    await prisma.campus.deleteMany({});

    // Create test campus
    const campus = await prisma.campus.create({
      data: {
        id: campusId,
        name: 'Test Rajahmundry Campus',
        location: 'Rajahmundry',
        facilities: 'A/C Labs, Hostel',
        studentsCount: 100,
        established: '2020',
        address: 'Test Address'
      }
    });

    // Create test program
    await prisma.program.create({
      data: {
        id: programId,
        name: 'B.Tech CSE',
        department: 'Engineering',
        type: 'UG',
        category: 'Engineering',
        duration: '4 Years',
        annualFee: 93000,
        devFee: 8000,
        totalSeats: 180,
        icon: '💻',
        minPercentage: 60.0,
        entranceExam: 'EAPCET',
        eligibilityText: '10+2',
        subjects: 'Maths, Physics, Coding',
        campusIds: String(campus.id)
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe('Programs API', () => {
    it('GET /api/programs returns 200 with array of programs', async () => {
      const res = await request(app).get('/api/programs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/programs?type=UG returns only UG programs', async () => {
      const res = await request(app).get('/api/programs?type=UG');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((p: any) => p.type === 'UG')).toBe(true);
    });

    it('GET /api/programs/1 returns 200 with program id 1', async () => {
      const res = await request(app).get(`/api/programs/${programId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(programId);
    });

    it('GET /api/programs/9999 returns 404 with success:false', async () => {
      const res = await request(app).get('/api/programs/9999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Enquiries API', () => {
    it('POST /api/enquiries/create with valid body returns 201 with success:true and aiRecommendation', async () => {
      const res = await request(app)
        .post('/api/enquiries/create')
        .send({
          fullName: 'Test Student',
          phone: '9876543210',
          email: 'test@test.com',
          programId: programId
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('aiRecommendation');
      expect(typeof res.body.data.aiRecommendation).toBe('string');
      createdEnquiryId = res.body.data.id;
    });

    it('POST /api/enquiries/create with missing fullName returns 400 with errors array containing field:"fullName"', async () => {
      const res = await request(app)
        .post('/api/enquiries/create')
        .send({
          phone: '9876543210',
          email: 'test@test.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.some((e: any) => e.field === 'fullName')).toBe(true);
    });

    it('POST /api/enquiries/create with invalid email returns 400', async () => {
      const res = await request(app)
        .post('/api/enquiries/create')
        .send({
          fullName: 'Test Student',
          phone: '9876543210',
          email: 'notanemail'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/enquiries/create with phone "123" returns 400', async () => {
      const res = await request(app)
        .post('/api/enquiries/create')
        .send({
          fullName: 'Test Student',
          phone: '123',
          email: 'test@test.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/enquiries returns 200 with array', async () => {
      const res = await request(app).get('/api/enquiries');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('PATCH /api/enquiries/:id/status with body returns 200 with updated status', async () => {
      const res = await request(app)
        .patch(`/api/enquiries/${createdEnquiryId}/status`)
        .send({
          status: 'contacted',
          note: 'Called student'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('contacted');
    });
  });

  describe('AI Route', () => {
    it('POST /api/ai/faq with fee question returns 200 with answer containing fee or ₹', async () => {
      const res = await request(app)
        .post('/api/ai/faq')
        .send({ question: 'What is the fee?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const answer = res.body.data.answer.toLowerCase();
      expect(answer.includes('fee') || answer.includes('₹')).toBe(true);
    });

    it('POST /api/ai/faq with hostel question returns 200 with answer containing hostel', async () => {
      const res = await request(app)
        .post('/api/ai/faq')
        .send({ question: 'Is hostel available?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.answer.toLowerCase()).toContain('hostel');
    });
  });

  describe('Analytics', () => {
    it('GET /api/analytics returns 200 with analytics summaries', async () => {
      const res = await request(app).get('/api/analytics');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalEnquiries');
      expect(res.body.data).toHaveProperty('byStatus');
      expect(res.body.data).toHaveProperty('byPriority');
      expect(typeof res.body.data.totalEnquiries).toBe('number');
    });
  });
});
