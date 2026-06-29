import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Campus, Program } from '../models/models';

const programRouter = Router();
export const campusRouter = Router();

// GET /api/campuses - All campuses with split facilities
campusRouter.get('/', async (req: Request, res: Response) => {
  try {
    const campuses = await Campus.find().lean();
    const formatted = campuses.map((c: any) => ({
      id: c._id.toString(),
      ...c,
      facilities: c.facilities ? c.facilities.split(',').map((f: string) => f.trim()) : []
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
    const totalPrograms = await Program.countDocuments();
    const totalCampuses = await Campus.countDocuments();
    const programs = await Program.find({}, 'totalSeats').lean();
    const totalSeats = programs.reduce((sum: number, p: any) => sum + (p.totalSeats || 0), 0);

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
      where.type = type.toUpperCase();
    }

    if (category && typeof category === 'string' && category !== '') {
      where.category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    }

    if (campusId && typeof campusId === 'string' && campusId !== '') {
      const isObjectId = mongoose.Types.ObjectId.isValid(campusId);
      const searchRegex = new RegExp(campusId, 'i');
      
      const campuses = await Campus.find({
        $or: [
          { name: searchRegex },
          { location: searchRegex },
          ...(isObjectId ? [{ _id: campusId }] : [])
        ]
      }).lean();

      const campusIdsList = campuses.map((c: any) => c._id.toString());
      if (campusIdsList.length > 0) {
        where.$or = campusIdsList.map(id => ({
          campusIds: { $regex: id }
        }));
      } else {
        return res.status(200).json({ success: true, data: [] });
      }
    }

    const programs = await Program.find(where).lean();
    const formatted = programs.map((p: any) => ({
      id: p._id.toString(),
      ...p,
      subjects: p.subjects ? p.subjects.split(',').map((s: string) => s.trim()) : []
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
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid program ID format.'
      });
    }

    const program: any = await Program.findById(id).lean();
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    // Resolve campuses
    const campusIdsList = program.campusIds ? program.campusIds.split(',').filter(Boolean) : [];
    const campuses = await Campus.find({ _id: { $in: campusIdsList } }).lean();

    const formatted = {
      id: program._id.toString(),
      ...program,
      campuses: campuses.map((c: any) => ({ id: c._id.toString(), ...c })),
      subjects: program.subjects ? program.subjects.split(',').map((s: string) => s.trim()) : []
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
