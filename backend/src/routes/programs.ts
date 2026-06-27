/*
Postman Request/Response Documentation:

1. GET /api/programs
Request: GET http://localhost:5000/api/programs?campusId=Rajahmundry&type=UG
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 101,
      "name": "B.Tech CSE",
      "department": "Engineering",
      "type": "UG",
      "category": "Engineering",
      "duration": "4 Years",
      "annualFee": 93000,
      "devFee": 8000,
      "totalSeats": 180,
      "icon": "💻",
      "minPercentage": 60,
      "entranceExam": "EAPCET / JEE",
      "eligibilityText": "10+2 / Intermediate with Maths & Physics",
      "subjects": ["Programming in Python", "Data Structures & Algorithms"],
      "campusIds": "1",
      "createdAt": "2026-06-27T04:12:13.000Z"
    }
  ]
}

2. GET /api/programs/:id
Request: GET http://localhost:5000/api/programs/101
Response: 200 OK
{
  "success": true,
  "data": {
    "id": 101,
    "name": "B.Tech CSE",
    "department": "Engineering",
    "type": "UG",
    "category": "Engineering",
    "duration": "4 Years",
    "annualFee": 93000,
    "devFee": 8000,
    "totalSeats": 180,
    "icon": "💻",
    "minPercentage": 60,
    "entranceExam": "EAPCET / JEE",
    "eligibilityText": "10+2 / Intermediate with Maths & Physics",
    "subjects": ["Programming in Python", "Data Structures & Algorithms"],
    "campusIds": "1",
    "createdAt": "2026-06-27T04:12:13.000Z"
  }
}

3. GET /api/campuses
Request: GET http://localhost:5000/api/campuses
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Rajahmundry Campus",
      "location": "Rajahmundry",
      "studentsCount": 2450,
      "established": "1995",
      "facilities": ["A/C Labs", "High-speed Wi-Fi"],
      "createdAt": "2026-06-27T04:12:13.000Z"
    }
  ]
}

4. GET /api/programs/stats
Request: GET http://localhost:5000/api/programs/stats
Response: 200 OK
{
  "success": true,
  "data": {
    "totalPrograms": 18,
    "totalSeats": 1240,
    "totalCampuses": 4,
    "placementRate": 94
  }
}
*/

import { Router, Request, Response } from 'express';
import prisma from '../config/db';

const programRouter = Router();
export const campusRouter = Router();

// GET /api/campuses - All campuses with split facilities
campusRouter.get('/', async (req: Request, res: Response) => {
  try {
    const campuses = await prisma.campus.findMany();
    const formatted = campuses.map(c => ({
      ...c,
      facilities: c.facilities ? c.facilities.split(',').map(f => f.trim()) : []
    }));
    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    console.error('Error fetching campuses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch campuses due to a server error.',
      error: error.message
    });
  }
});

// GET /api/programs/stats - Summary numbers
programRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalPrograms = await prisma.program.count();
    const totalCampuses = await prisma.campus.count();
    const programs = await prisma.program.findMany({ select: { totalSeats: true } });
    const totalSeats = programs.reduce((sum, p) => sum + (p.totalSeats || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        totalPrograms,
        totalSeats,
        totalCampuses,
        placementRate: 94
      }
    });
  } catch (error: any) {
    console.error('Error fetching programs stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch program stats due to a server error.',
      error: error.message
    });
  }
});

// GET /api/programs - List with filters
programRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { campusId, type, category } = req.query;
    const where: any = {};

    if (type && typeof type === 'string' && type !== '') {
      where.type = type;
    }

    if (category && typeof category === 'string' && category !== '') {
      where.category = category;
    }

    if (campusId && typeof campusId === 'string' && campusId !== '') {
      // Resolve campus IDs matching name, location, or numeric id
      const campuses = await prisma.campus.findMany({
        where: {
          OR: [
            { name: { contains: campusId } },
            { location: { contains: campusId } },
            { id: isNaN(Number(campusId)) ? undefined : Number(campusId) }
          ].filter(Boolean) as any
        }
      });
      const campusIdsList = campuses.map(c => c.id);
      if (campusIdsList.length > 0) {
        where.OR = campusIdsList.map(id => ({
          campusIds: { contains: String(id) }
        }));
      } else {
        return res.status(200).json({ success: true, data: [] });
      }
    }

    const programs = await prisma.program.findMany({ where });
    const formatted = programs.map(p => ({
      ...p,
      subjects: p.subjects ? p.subjects.split(',').map(s => s.trim()) : []
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    console.error('Error listing programs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list programs due to a server error.',
      error: error.message
    });
  }
});

// GET /api/programs/:id - Details by ID
programRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid program ID format.'
      });
    }

    const program = await prisma.program.findUnique({
      where: { id },
      include: { campuses: true }
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    const formatted = {
      ...program,
      subjects: program.subjects ? program.subjects.split(',').map(s => s.trim()) : []
    };

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    console.error('Error fetching program detail:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch program detail due to a server error.',
      error: error.message
    });
  }
});

export default programRouter;
