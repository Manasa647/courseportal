import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { WorkflowService } from '../services/workflowService';

const router = Router();

// GET /list?studentId=X
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;

    if (!studentId || isNaN(Number(studentId))) {
      return res.status(400).json({
        success: false,
        message: 'A valid studentId is required.',
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

    const rawDrives = await prisma.placementDrive.findMany();
    const formattedDrives = rawDrives.map(d => ({
      id: d.id,
      title: d.title,
      eligiblePrograms: d.eligiblePrograms.split(',').map(p => p.trim())
    }));

    const matchedDrives = WorkflowService.matchPlacementDrives(programName, formattedDrives);

    return res.status(200).json({
      success: true,
      data: matchedDrives,
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

export default router;
