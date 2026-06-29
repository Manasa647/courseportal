import request from 'supertest';
import { app, server } from '../src/server';
import prisma from '../src/config/db';

describe('Sri Gowthami API Integration Tests', () => {
  let createdEnquiryId: number;

  beforeAll(async () => {
    // Clean database before starting
    await prisma.followUp.deleteMany({});
    await prisma.statusHistory.deleteMany({});
    await prisma.enquiry.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.program.deleteMany({});
    await prisma.campus.deleteMany({});

    // Seed 4 campuses
    await prisma.campus.createMany({
      data: [
        { id: 1, name: 'Rajahmundry Campus', location: 'Rajahmundry', established: '1995', studentsCount: 2450, facilities: 'A/C Labs,Hostels', address: 'Main Road' },
        { id: 2, name: 'Peddapuram Campus', location: 'Peddapuram', established: '2002', studentsCount: 1320, facilities: 'Workshops', address: 'ADB Road' },
        { id: 3, name: 'Kakinada Campus', location: 'Kakinada', established: '1999', studentsCount: 1890, facilities: 'Research Center', address: 'Sarpavaram' },
        { id: 4, name: 'Kovvur Campus', location: 'Kovvur', established: '2010', studentsCount: 780, facilities: 'Classrooms', address: 'NH-16' }
      ]
    });

    // Seed 18 programs
    const programsData = Array.from({ length: 18 }, (_, idx) => {
      const id = idx + 1;
      const totalSeats = id === 18 ? 50 : 70; // 17 * 70 + 50 = 1240 total seats
      return {
        id,
        name: id === 1 ? 'B.Tech CSE' : `Test Program ${id}`,
        department: 'Engineering',
        type: id % 2 === 0 ? 'PG' : 'UG',
        category: 'Engineering',
        duration: '3 Years',
        annualFee: 50000,
        devFee: 5000,
        totalSeats,
        icon: '🎓',
        minPercentage: 50,
        entranceExam: 'None',
        eligibilityText: '10+2',
        subjects: 'Subject1, Subject2',
        campusIds: '1'
      };
    });

    await prisma.program.createMany({
      data: programsData
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe('Programs API', () => {
    it('GET /api/programs returns 200 with array of 18 programs', async () => {
      const res = await request(app).get('/api/programs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(18);
    });

    it('GET /api/programs?type=UG returns only UG programs all having type UG', async () => {
      const res = await request(app).get('/api/programs?type=UG');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((p: any) => p.type === 'UG')).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/programs/stats returns stats with totalSeats 1240', async () => {
      const res = await request(app).get('/api/programs/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({
        totalPrograms: 18,
        totalSeats: 1240,
        totalCampuses: 4,
        placementRate: 94
      });
    });

    it('GET /api/programs/999 returns 404 with success:false', async () => {
      const res = await request(app).get('/api/programs/999');
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
          programId: 1
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('aiRecommendation');
      expect(res.body.data.aiRecommendation).not.toBeNull();
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

    it('POST /api/enquiries/:id/process returns 200 with updated status', async () => {
      const res = await request(app)
        .post(`/api/enquiries/${createdEnquiryId}/process`)
        .send({ note: 'Processing...' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('contacted');
    });
  });

  describe('AI Route', () => {
    it('POST /api/ai/faq with fee question returns 200 with answer containing fee or rupee symbol', async () => {
      const res = await request(app)
        .post('/api/ai/faq')
        .send({ question: 'What is the fee?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const answer = res.body.data.answer.toLowerCase();
      expect(answer.includes('fee') || answer.includes('₹') || answer.includes('rupee')).toBe(true);
    });

    it('POST /api/ai/faq with hostel question returns 200 with answer containing hostel', async () => {
      const res = await request(app)
        .post('/api/ai/faq')
        .send({ question: 'Is hostel available?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.answer.toLowerCase()).toContain('hostel');
    });

    it('POST /api/ai/recommend-courses with interests returns 200 with array of length 3', async () => {
      const res = await request(app)
        .post('/api/ai/recommend-courses')
        .send({ interests: 'computers programming' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(3);
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
      expect(res.body.data).toHaveProperty('todayCount');
      expect(res.body.data).toHaveProperty('thisWeekCount');
    });
  });
});
