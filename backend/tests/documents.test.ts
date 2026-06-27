import request from 'supertest';
import { app, server } from '../src/server';
import prisma from '../src/config/db';
import fs from 'fs';
import path from 'path';

describe('Course & Program Portal - Documents API Integration Tests', () => {
  let docId: number;
  const dummyFilePath = path.join(__dirname, 'test-doc.png');
  const largeFilePath = path.join(__dirname, 'large-doc.png');
  const invalidFilePath = path.join(__dirname, 'test-doc.txt');

  beforeAll(async () => {
    // Clear docs table
    await prisma.document.deleteMany({});

    // Create dummy test files
    fs.writeFileSync(dummyFilePath, 'dummy image content');
    fs.writeFileSync(invalidFilePath, 'dummy text content');
    
    // Create a 6MB dummy file
    const buffer = Buffer.alloc(6 * 1024 * 1024);
    fs.writeFileSync(largeFilePath, buffer);
  });

  afterAll(async () => {
    // Clean up test files
    if (fs.existsSync(dummyFilePath)) fs.unlinkSync(dummyFilePath);
    if (fs.existsSync(invalidFilePath)) fs.unlinkSync(invalidFilePath);
    if (fs.existsSync(largeFilePath)) fs.unlinkSync(largeFilePath);

    // Clean up database uploaded files if any
    const docs = await prisma.document.findMany();
    for (const doc of docs) {
      const filename = path.basename(doc.fileUrl);
      const filePath = path.join(__dirname, '../../uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {}
      }
    }
    await prisma.document.deleteMany({});

    await prisma.$disconnect();
    server.close();
  });

  describe('POST /api/documents/upload', () => {
    it('should fail with 400 Bad Request when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .attach('file', dummyFilePath)
        .field('documentType', 'ID Proof'); // missing entityType and entityId

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with 400 when file type is not allowed', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .attach('file', invalidFilePath) // .txt extension
        .field('entityType', 'student')
        .field('entityId', 1)
        .field('documentType', 'ID Proof');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Only pdf, jpg, and png files are allowed.');
    });

    it('should fail with 400 when file exceeds 5MB size limit', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .attach('file', largeFilePath)
        .field('entityType', 'student')
        .field('entityId', 1)
        .field('documentType', 'ID Proof');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('File too large');
    });

    it('should upload document successfully and return servable url', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .attach('file', dummyFilePath)
        .field('entityType', 'student')
        .field('entityId', 1)
        .field('documentType', 'ID Proof');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.fileUrl).toContain('/uploads/');

      docId = response.body.data.id;
    });
  });

  describe('GET /api/documents/list', () => {
    it('should list all documents uploaded for the entity', async () => {
      const response = await request(app)
        .get('/api/documents/list?entityType=student&entityId=1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].id).toBe(docId);
    });
  });

  describe('GET /api/documents/checklist', () => {
    it('should return a checklist indicating uploaded and missing documents', async () => {
      const response = await request(app)
        .get('/api/documents/checklist?entityType=student&entityId=1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ documentType: 'ID Proof', status: 'uploaded' }),
          expect.objectContaining({ documentType: 'Previous Transcript', status: 'missing' }),
          expect.objectContaining({ documentType: 'Photo', status: 'missing' }),
          expect.objectContaining({ documentType: 'Transfer Certificate', status: 'missing' }),
        ])
      );
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete database record and remove file from disk', async () => {
      const response = await request(app)
        .delete(`/api/documents/${docId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify DB
      const dbDoc = await prisma.document.findUnique({ where: { id: docId } });
      expect(dbDoc).toBeNull();
    });
  });
});
