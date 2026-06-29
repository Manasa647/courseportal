import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { WorkflowService } from '../services/workflowService';

const router = Router();

// GET /list?studentId=X
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;

    const rawDrives = await prisma.placementDrive.findMany({
      orderBy: { driveDate: 'desc' }
    });

    const formattedDrives = rawDrives.map(d => ({
      id: d.id,
      title: d.title,
      company: d.company,
      location: d.location,
      driveDate: d.driveDate,
      eligiblePrograms: d.eligiblePrograms.split(',').map(p => p.trim())
    }));

    if (studentId !== undefined && studentId !== '') {
      if (isNaN(Number(studentId))) {
        return res.status(400).json({
          success: false,
          message: 'studentId query parameter must be a valid number.',
        });
      }

      const student = await prisma.student.findUnique({
        where: { id: Number(studentId) },
        include: {
          application: {
            include: { program: true }
          }
        }
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student record not found.',
        });
      }

      const programName = student.application?.program?.name;
      if (!programName) {
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No registered program found for this student.'
        });
      }

      const matchedDrives = WorkflowService.matchPlacementDrives(programName, formattedDrives);
      return res.status(200).json({
        success: true,
        data: matchedDrives,
      });
    }

    return res.status(200).json({
      success: true,
      data: formattedDrives,
    });
  } catch (error: any) {
    console.error('Error listing placement drives:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch placement drives due to a server error.',
      error: error.message,
    });
  }
});

// POST /create
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { title, eligiblePrograms, company, location, driveDate } = req.body;
    const errors: string[] = [];

    if (!title || typeof title !== 'string' || title.trim() === '') {
      errors.push('title is required and must be a non-empty string.');
    }
    if (!eligiblePrograms || (typeof eligiblePrograms !== 'string' && !Array.isArray(eligiblePrograms))) {
      errors.push('eligiblePrograms is required and must be a comma-separated string or an array of strings.');
    }
    if (!company || typeof company !== 'string' || company.trim() === '') {
      errors.push('company is required and must be a non-empty string.');
    }
    if (!location || typeof location !== 'string' || location.trim() === '') {
      errors.push('location is required and must be a non-empty string.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    const formattedEligiblePrograms = Array.isArray(eligiblePrograms)
      ? eligiblePrograms.join(',')
      : eligiblePrograms;

    const newDrive = await prisma.placementDrive.create({
      data: {
        title,
        eligiblePrograms: formattedEligiblePrograms,
        company,
        location,
        driveDate: driveDate ? new Date(driveDate) : new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Placement drive created successfully.',
      data: {
        ...newDrive,
        eligiblePrograms: newDrive.eligiblePrograms.split(',').map(p => p.trim())
      },
    });
  } catch (error: any) {
    console.error('Error creating placement drive:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create placement drive due to a server error.',
      error: error.message,
    });
  }
});

export default router;
