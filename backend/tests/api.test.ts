process.env.PORT = '0'; // Run on a random port to avoid EADDRINUSE with running dev server

// In-memory mock databases attached to mongooseMock
const mockCampuses: any[] = [];
const mockPrograms: any[] = [];
const mockEnquiries: any[] = [];
const mockFollowUps: any[] = [];
const mockStatusHistories: any[] = [];

jest.mock('mongoose', () => {
  const mongooseMock = jest.requireActual('mongoose');

  mongooseMock.connect = () => Promise.resolve({
    connection: { host: 'mock-host' }
  });

  const originalModel = mongooseMock.model.bind(mongooseMock);

  mongooseMock.model = function(name: string, schema?: any): any {
    if (name === 'Campus') {
      return {
        deleteMany: () => {
          mockCampuses.length = 0;
          return Promise.resolve({ deletedCount: 0 });
        },
        insertMany: (data: any[]) => {
          const docs = data.map((d: any) => ({ ...d, _id: d._id || new mongooseMock.Types.ObjectId() }));
          mockCampuses.push(...docs);
          return Promise.resolve(docs);
        },
        find: () => ({
          lean: () => Promise.resolve(mockCampuses)
        }),
        countDocuments: () => Promise.resolve(4),
        findById: (id: any) => ({
          lean: () => Promise.resolve(mockCampuses.find((c: any) => c._id.toString() === id.toString()))
        })
      } as any;
    }
    if (name === 'Program') {
      return {
        deleteMany: () => {
          mockPrograms.length = 0;
          return Promise.resolve({ deletedCount: 0 });
        },
        insertMany: (data: any[]) => {
          const docs = data.map((d: any) => ({ ...d, _id: d._id || new mongooseMock.Types.ObjectId() }));
          mockPrograms.push(...docs);
          return Promise.resolve(docs);
        },
        find: (query: any) => ({
          lean: () => {
            let list = mockPrograms;
            if (query && query.type) {
              list = list.filter((p: any) => p.type === query.type);
            }
            return Promise.resolve(list);
          }
        }),
        countDocuments: () => Promise.resolve(18),
        findById: (id: any) => ({
          lean: () => {
            const prog = mockPrograms.find((p: any) => p._id.toString() === id.toString());
            return Promise.resolve(prog || null);
          }
        })
      } as any;
    }
    if (name === 'Course') {
      return {
        deleteMany: () => Promise.resolve({ deletedCount: 0 }),
        insertMany: (data: any[]) => Promise.resolve(data)
      } as any;
    }
    if (name === 'Enquiry') {
      return {
        deleteMany: () => {
          mockEnquiries.length = 0;
          return Promise.resolve({ deletedCount: 0 });
        },
        countDocuments: () => Promise.resolve(mockEnquiries.length),
        aggregate: (pipeline: any[]) => {
          const groupField = pipeline[0].$group._id.replace('$', '');
          const counts: Record<string, number> = {};
          mockEnquiries.forEach((e: any) => {
            const val = e[groupField];
            counts[val] = (counts[val] || 0) + 1;
          });
          return Promise.resolve(Object.entries(counts).map(([key, count]) => ({ _id: key, count })));
        },
        create: (data: any) => {
          const doc = {
            _id: new mongooseMock.Types.ObjectId(),
            ...data,
            toObject: function() { return this; }
          };
          mockEnquiries.push(doc);
          return Promise.resolve(doc);
        },
        find: () => ({
          populate: function() { return this; },
          sort: function() { return this; },
          lean: () => Promise.resolve(mockEnquiries)
        }),
        findById: (id: any) => {
          const enquiry = mockEnquiries.find((e: any) => e._id.toString() === id.toString());
          return {
            _id: enquiry?._id,
            status: enquiry?.status,
            save: function(this: any) {
              if (enquiry) enquiry.status = this.status;
              return Promise.resolve(enquiry);
            },
            toObject: function() { return enquiry; },
            lean: () => Promise.resolve(enquiry || null)
          };
        },
        findByIdAndUpdate: (id: any, update: any) => {
          const enquiry = mockEnquiries.find((e: any) => e._id.toString() === id.toString());
          if (enquiry && update.status) enquiry.status = update.status;
          return Promise.resolve(enquiry);
        }
      } as any;
    }
    if (name === 'FollowUp') {
      return {
        deleteMany: () => {
          mockFollowUps.length = 0;
          return Promise.resolve({ deletedCount: 0 });
        },
        insertMany: (data: any[]) => {
          const docs = data.map((d: any) => ({ ...d, _id: d._id || new mongooseMock.Types.ObjectId() }));
          mockFollowUps.push(...docs);
          return Promise.resolve(docs);
        },
        create: (data: any) => {
          const doc = {
            _id: new mongooseMock.Types.ObjectId(),
            ...data,
            toObject: function() { return this; }
          };
          mockFollowUps.push(doc);
          return Promise.resolve(doc);
        },
        find: () => ({
          sort: function() { return this; },
          lean: () => Promise.resolve(mockFollowUps)
        }),
        findByIdAndUpdate: (id: any, update: any) => {
          const f = mockFollowUps.find((item: any) => item._id?.toString() === id.toString());
          if (f && update.status) f.status = update.status;
          return Promise.resolve({
            _id: id,
            ...f,
            toObject: function() { return this; }
          });
        }
      } as any;
    }
    if (name === 'StatusHistory') {
      return {
        deleteMany: () => {
          mockStatusHistories.length = 0;
          return Promise.resolve({ deletedCount: 0 });
        },
        create: (data: any) => {
          const doc = { _id: new mongooseMock.Types.ObjectId(), ...data };
          mockStatusHistories.push(doc);
          return Promise.resolve(doc);
        },
        find: () => ({
          sort: function() { return this; },
          lean: () => Promise.resolve(mockStatusHistories)
        })
      } as any;
    }

    try {
      return originalModel(name, schema);
    } catch (e) {
      return {
        find: () => ({ lean: () => Promise.resolve([]) }),
        findOne: () => ({ select: () => ({ lean: () => Promise.resolve(null) }) })
      } as any;
    }
  };

  return mongooseMock;
});

jest.mock('../src/config/db', () => ({
  connectDB: () => Promise.resolve(),
  default: require('mongoose')
}));

import request from 'supertest';
import { app, server } from '../src/server';
import { Campus, Program, Course, Enquiry, StatusHistory, FollowUp } from '../src/models/models';

describe('Sri Gowthami API Integration Tests', () => {
  let createdEnquiryId: string;
  const mockCampusId = '64a8b792e3cf14a1a0f90001';
  const mockProgramId = '64a8b792e3cf14a1a0f90101';

  beforeAll(async () => {
    // Clean database before starting
    await Promise.all([
      FollowUp.deleteMany({}),
      StatusHistory.deleteMany({}),
      Enquiry.deleteMany({}),
      Course.deleteMany({}),
      Program.deleteMany({}),
      Campus.deleteMany({})
    ]);

    // Seed 4 campuses
    await Campus.insertMany([
      { _id: mockCampusId, name: 'Rajahmundry Campus', location: 'Rajahmundry', established: '1995', studentsCount: 2450, facilities: 'A/C Labs,Hostels', address: 'Main Road' },
      { _id: '64a8b792e3cf14a1a0f90002', name: 'Peddapuram Campus', location: 'Peddapuram', established: '2002', studentsCount: 1320, facilities: 'Workshops', address: 'ADB Road' },
      { _id: '64a8b792e3cf14a1a0f90003', name: 'Kakinada Campus', location: 'Kakinada', established: '1999', studentsCount: 1890, facilities: 'Research Center', address: 'Sarpavaram' },
      { _id: '64a8b792e3cf14a1a0f90004', name: 'Kovvur Campus', location: 'Kovvur', established: '2010', studentsCount: 780, facilities: 'Classrooms', address: 'NH-16' }
    ]);

    // Seed 18 programs
    const programsData = Array.from({ length: 18 }, (_, idx) => {
      const idStr = (idx + 1).toString().padStart(2, '0');
      const _id = idx === 0 ? mockProgramId : `64a8b792e3cf14a1a0f901${idStr}`;
      const totalSeats = idx === 17 ? 50 : 70; // 17 * 70 + 50 = 1240 total seats
      return {
        _id,
        name: idx === 0 ? 'B.Tech CSE' : `Test Program ${idx + 1}`,
        department: 'Engineering',
        type: idx % 2 === 1 ? 'PG' : 'UG',
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
        campusIds: mockCampusId
      };
    });

    await Program.insertMany(programsData);
  });

  afterAll(async () => {
    server.close();
  });

  describe('Programs API', () => {
    it('GET /api/programs returns 200 with array of 18 programs', async () => {
      const res = await request(app).get('/api/programs');
      if (res.status !== 200) console.log('DEBUG 500 ERROR:', res.status, res.body);
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

    it('GET /api/programs/64a8b792e3cf14a1a0f90999 returns 404 with success:false', async () => {
      const res = await request(app).get('/api/programs/64a8b792e3cf14a1a0f90999');
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
          programId: mockProgramId
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
