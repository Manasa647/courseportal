import request from 'supertest';
import { app, server } from '../src/server';
import prisma from '../src/config/db';

describe('Course & Program Portal - Integration Test Pipeline', () => {
  let campusId: number;
  let programId: number;
  let enquiryId: number;
  let followUpId: number;

  beforeAll(async () => {
    // Clean tables related to the test
    await prisma.followUp.deleteMany({});
    await prisma.enquiry.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.program.deleteMany({});
    await prisma.campus.deleteMany({});

    // Seed dummy campus & program for foreign keys
    const campus = await prisma.campus.create({
      data: {
        name: 'Test Campus',
        location: 'Test Location',
        address: '123 Test St',
      },
    });
    campusId = campus.id;

    const program = await prisma.program.create({
      data: {
        name: 'Test Program',
        description: 'Test Description',
        department: 'Test Department',
      },
    });
    programId = program.id;
  });

  afterAll(async () => {
    // Close servers and DB client
    await prisma.$disconnect();
    server.close();
  });

  describe('POST /api/enquiries/create', () => {
    it('should fail with 400 Bad Request when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/enquiries/create')
        .send({
          email: 'invalid-email',
          programId,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Name is required and must be a valid string.');
      expect(response.body.errors).toContain('Email is required and must be a valid email address.');
    });

    it('should successfully create a new enquiry, assign priority, run AI advice, and generate scheduled follow-ups', async () => {
      const response = await request(app)
        .post('/api/enquiries/create')
        .send({
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          phone: '1234567',
          programId: programId,
          campusId: campusId,
          backgroundNotes: 'I am highly motivated to start computer science immediately! Urgent request.',
          source: 'Website',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      enquiryId = response.body.data.id;

      // Verify DB entries
      const dbEnquiry = await prisma.enquiry.findUnique({
        where: { id: enquiryId },
        include: { followUps: true },
      });

      expect(dbEnquiry).not.toBeNull();
      expect(dbEnquiry!.priority).toBe('HIGH'); // due to 'immediately' & 'urgent'
      expect(dbEnquiry!.aiRecommendation).toContain('Jane Doe');
      expect(dbEnquiry!.followUps.length).toBe(3); // 3 scheduled tasks

      followUpId = dbEnquiry!.followUps[0].id;
    });
  });

  describe('GET /api/enquiries/list', () => {
    it('should return all enquiry records with joins', async () => {
      const response = await request(app)
        .get('/api/enquiries/list');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      
      const record = response.body.data.find((e: any) => e.id === enquiryId);
      expect(record).toBeDefined();
      expect(record.program.name).toBe('Test Program');
      expect(record.campus.name).toBe('Test Campus');
    });

    it('should support filtering by status', async () => {
      const response = await request(app)
        .get('/api/enquiries/list?status=pending');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty list when filtered with no match', async () => {
      const response = await request(app)
        .get('/api/enquiries/list?status=admitted');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /api/enquiries/detail', () => {
    it('should return 400 for bad ID formats', async () => {
      const response = await request(app)
        .get('/api/enquiries/detail?id=abc');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent IDs', async () => {
      const response = await request(app)
        .get('/api/enquiries/detail?id=99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return full record details with program, campus, and follow-ups list', async () => {
      const response = await request(app)
        .get(`/api/enquiries/detail?id=${enquiryId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(enquiryId);
      expect(response.body.data.program.id).toBe(programId);
      expect(response.body.data.campus.id).toBe(campusId);
      expect(response.body.data.followUps.length).toBe(3);
    });
  });

  describe('PATCH /api/enquiries/followup/:id', () => {
    it('should fail with 400 for invalid statuses', async () => {
      const response = await request(app)
        .patch(`/api/enquiries/followup/${followUpId}`)
        .send({ status: 'invalid-status' });

      expect(response.status).toBe(400);
    });

    it('should successfully update the status of the follow-up task', async () => {
      const response = await request(app)
        .patch(`/api/enquiries/followup/${followUpId}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');

      const dbFollowUp = await prisma.followUp.findUnique({
        where: { id: followUpId },
      });
      expect(dbFollowUp!.status).toBe('completed');
    });
  });

  describe('POST /api/enquiries/:id/process & GET /:id/history', () => {
    beforeAll(async () => {
      // Re-initialize the test enquiry status to pending (or new)
      await prisma.enquiry.update({
        where: { id: enquiryId },
        data: { status: 'pending' },
      });
      // Clear status histories for this enquiry so we have a clean slate
      await prisma.statusHistory.deleteMany({
        where: { enquiryId },
      });
    });

    it('should successfully progress status from pending to contacted', async () => {
      const response = await request(app)
        .post(`/api/enquiries/${enquiryId}/process`)
        .send({ note: 'Contacted candidate' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('contacted');

      // Verify history table contains the record
      const historyRes = await request(app)
        .get(`/api/enquiries/${enquiryId}/history`);
      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data.length).toBe(1);
      expect(historyRes.body.data[0].fromStatus).toBe('pending');
      expect(historyRes.body.data[0].toStatus).toBe('contacted');
      expect(historyRes.body.data[0].note).toBe('Contacted candidate');
    });

    it('should progress from contacted to applied', async () => {
      const response = await request(app)
        .post(`/api/enquiries/${enquiryId}/process`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('applied');
    });

    it('should progress from applied to admitted', async () => {
      const response = await request(app)
        .post(`/api/enquiries/${enquiryId}/process`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('admitted');
    });

    it('should progress from admitted to closed', async () => {
      const response = await request(app)
        .post(`/api/enquiries/${enquiryId}/process`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('closed');
    });

    it('should fail with 400 when attempting to transition a closed enquiry', async () => {
      const response = await request(app)
        .post(`/api/enquiries/${enquiryId}/process`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid status transition');
    });

    it('should return all status histories ordered by changedAt ascending', async () => {
      const response = await request(app)
        .get(`/api/enquiries/${enquiryId}/history`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(4);
      
      // Verify changedAt is ascending
      const dates = response.body.data.map((h: any) => new Date(h.changedAt).getTime());
      const sortedDates = [...dates].sort((a, b) => a - b);
      expect(dates).toEqual(sortedDates);
    });
  });
});
