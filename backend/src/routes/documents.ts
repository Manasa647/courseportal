import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/db';

const router = Router();

// Configure local disk storage directory
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure Multer engine
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowedExt = allowedExtensions.includes(ext);
    const isAllowedMime = allowedMimeTypes.includes(file.mimetype);

    if (isAllowedExt && isAllowedMime) {
      cb(null, true);
    } else {
      cb(new Error('Only pdf, jpg, and png files are allowed.'));
    }
  },
});

// POST /upload (Accepts entityType, entityId, documentType, and file)
router.post('/upload', (req: Request, res: Response) => {
  const uploadSingle = upload.single('file');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
    }

    try {
      const { entityType, entityId, documentType } = req.body;
      const file = req.file;
      const errors: string[] = [];

      if (!entityType || !['student', 'application'].includes(entityType)) {
        errors.push("entityType is required and must be either 'student' or 'application'.");
      }
      if (!entityId || isNaN(Number(entityId))) {
        errors.push('entityId is required and must be a valid integer.');
      }
      if (!documentType || typeof documentType !== 'string' || documentType.trim() === '') {
        errors.push('documentType is required and must be a string.');
      }
      if (!file) {
        errors.push('file is required and must be attached.');
      }

      if (errors.length > 0) {
        // Remove uploaded file if validation failed
        if (file) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors,
        });
      }

      const fileUrl = `/uploads/${file!.filename}`;

      // Create Document in Database
      const doc = await prisma.document.create({
        data: {
          entityType,
          entityId: Number(entityId),
          fileName: file!.originalname,
          fileUrl,
          documentType,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully.',
        data: doc,
      });
    } catch (error: any) {
      console.error('Error handling document upload:', error);
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {}
      }
      return res.status(500).json({
        success: false,
        message: 'Server error during document upload.',
        error: error.message,
      });
    }
  });
});

// GET /list?entityType=&entityId= (List documents for a student or application)
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.query;

    if (!entityType || !entityId || isNaN(Number(entityId))) {
      return res.status(400).json({
        success: false,
        message: 'entityType and a numeric entityId query parameters are required.',
      });
    }

    const docs = await prisma.document.findMany({
      where: {
        entityType: String(entityType),
        entityId: Number(entityId),
      },
      orderBy: {
        uploadDate: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: docs,
    });
  } catch (error: any) {
    console.error('Error listing documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list documents due to a server error.',
      error: error.message,
    });
  }
});

// DELETE /:id (Deletes file from disk and database record)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'A valid Document ID is required.',
      });
    }

    const doc = await prisma.document.findUnique({
      where: { id: Number(id) },
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document record not found.',
      });
    }

    // Attempt to unlink from disk
    const filename = path.basename(doc.fileUrl);
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.warn(`Failed to unlink file on disk: ${filePath}`, unlinkErr);
      }
    }

    // Delete record from database
    await prisma.document.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete document due to a server error.',
      error: error.message,
    });
  }
});

// GET /checklist?entityId= (Returns status on required documents)
router.get('/checklist', async (req: Request, res: Response) => {
  try {
    const { entityId, entityType } = req.query;

    if (!entityId || isNaN(Number(entityId))) {
      return res.status(400).json({
        success: false,
        message: 'A numeric entityId query parameter is required.',
      });
    }

    const typeFilter = entityType ? String(entityType) : 'student';
    const requiredTypes = ['ID Proof', 'Previous Transcript', 'Photo', 'Transfer Certificate'];

    // Retrieve uploaded documents
    const uploadedDocs = await prisma.document.findMany({
      where: {
        entityId: Number(entityId),
        entityType: typeFilter,
      },
    });

    const checklist = requiredTypes.map((requiredType) => {
      const doc = uploadedDocs.find(
        (d) => d.documentType.toLowerCase() === requiredType.toLowerCase()
      );
      return {
        documentType: requiredType,
        status: doc ? 'uploaded' : 'missing',
        document: doc || null,
      };
    });

    return res.status(200).json({
      success: true,
      data: checklist,
    });
  } catch (error: any) {
    console.error('Error fetching document checklist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch document checklist due to a server error.',
      error: error.message,
    });
  }
});

export default router;
