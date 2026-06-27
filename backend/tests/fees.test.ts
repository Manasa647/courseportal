import request from 'supertest';
import { app, server } from '../src/server';
import prisma from '../src/config/db';

describe('Course & Program Portal - Fees & Receipts Integration Tests', () => {
  let studentId: number;
  let campusId: number;
  let programId: number;
  let paymentId: number;
  let receiptId: number;

  beforeAll(async () => {
    // Clear databases
    await prisma.receipt.deleteMany({});
    await prisma.feePayment.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.campus.deleteMany({});
    await prisma.program.deleteMany({});

    // Seed campus & program
    const campus = await prisma.campus.create({
      data: {
        name: 'Boston Campus',
        location: 'Boston',
        address: '100 Main St',
      },
    });
    campusId = campus.id;

    const program = await prisma.program.create({
      data: {
        name: 'Data Science',
        description: 'DS program',
        department: 'Computing',
      },
    });
    programId = program.id;

    // Seed student
    const student = await prisma.student.create({
      data: {
        firstName: 'Emma',
        lastName: 'Watson',
        email: 'emma@example.com',
        dateOfBirth: new Date('2000-01-01'),
        campusId,
      },
    });
    studentId = student.id;

    // Associate an application for summary grouping logic
    await prisma.application.create({
      data: {
        studentId,
        programId,
        status: 'submitted',
      },
    });
  });

  afterAll(async () => {
    await prisma.receipt.deleteMany({});
    await prisma.feePayment.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.campus.deleteMany({});
    await prisma.program.deleteMany({});

    await prisma.$disconnect();
    server.close();
  });

  describe('POST /api/fees/create-payment', () => {
    it('should fail with 400 when amount is negative or invalid', async () => {
      const response = await request(app)
        .post('/api/fees/create-payment')
        .send({
          studentId,
          amount: -500,
          paymentMethod: 'Cash',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('amount is required and must be a positive number.');
    });

    it('should fail with 404 if student does not exist', async () => {
      const response = await request(app)
        .post('/api/fees/create-payment')
        .send({
          studentId: 9999,
          amount: 500,
          paymentMethod: 'Cash',
        });

      expect(response.status).toBe(404);
    });

    it('should record payment and generate receipt atomically', async () => {
      const response = await request(app)
        .post('/api/fees/create-payment')
        .send({
          studentId,
          amount: 1200.0,
          paymentMethod: 'Credit Card',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('payment');
      expect(response.body.data).toHaveProperty('receipt');
      expect(response.body.data.payment.amount).toBe(1200.0);
      expect(response.body.data.receipt.receiptNumber).toContain('REC-');

      paymentId = response.body.data.payment.id;
      receiptId = response.body.data.receipt.id;
    });

    it('should generate a unique receipt number for multiple payments', async () => {
      const response1 = await request(app)
        .post('/api/fees/create-payment')
        .send({
          studentId,
          amount: 300,
          paymentMethod: 'Bank Transfer',
        });

      const response2 = await request(app)
        .post('/api/fees/create-payment')
        .send({
          studentId,
          amount: 400,
          paymentMethod: 'Cash',
        });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.data.receipt.receiptNumber).not.toBe(
        response2.body.data.receipt.receiptNumber
      );
    });
  });

  describe('GET /api/fees/list?studentId=', () => {
    it('should return list of student payments and compute correct running total', async () => {
      const response = await request(app)
        .get(`/api/fees/list?studentId=${studentId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.payments.length).toBe(3); // 1200 + 300 + 400
      expect(response.body.data.runningTotal).toBe(1900.0);
    });
  });

  describe('GET /api/fees/receipt/:id', () => {
    it('should return 404 if receipt not found', async () => {
      const response = await request(app)
        .get('/api/fees/receipt/9999');

      expect(response.status).toBe(404);
    });

    it('should return receipt details with payment and student joins', async () => {
      const response = await request(app)
        .get(`/api/fees/receipt/${receiptId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(receiptId);
      expect(response.body.data.payment.amount).toBe(1200.0);
      expect(response.body.data.payment.student.firstName).toBe('Emma');
      expect(response.body.data.payment.student.campus.name).toBe('Boston Campus');
    });
  });

  describe('GET /api/fees/summary', () => {
    it('should return summary aggregated collections', async () => {
      const response = await request(app)
        .get('/api/fees/summary');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalCollectedThisMonth).toBe(1900.0);
      expect(response.body.data.byProgram['Data Science']).toBe(1900.0);
      expect(response.body.data.byCampus['Boston Campus']).toBe(1900.0);
    });
  });
});
