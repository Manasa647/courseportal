import { Request, Response, NextFunction } from 'express';

export function validateEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, programId, campusId } = req.body;

    const errors: string[] = [];

    if (!name || typeof name !== 'string' || name.trim() === '') {
      errors.push('Name is required and must be a valid string.');
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.push('Email is required and must be a valid email address.');
    }

    if (phone && (typeof phone !== 'string' || phone.trim().length < 5)) {
      errors.push('Phone number must be a valid contact number (at least 5 characters).');
    }

    if (programId !== undefined && programId !== null && programId !== '' && isNaN(Number(programId))) {
      errors.push('Program ID must be a valid integer.');
    }

    if (campusId !== undefined && campusId !== null && campusId !== '' && isNaN(Number(campusId))) {
      errors.push('Campus ID must be a valid integer.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during validation.',
    });
  }
}

export function validateStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, email, dateOfBirth, parent } = req.body;
    const errors: string[] = [];

    if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
      errors.push('First name is required and must be a valid string.');
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
      errors.push('Last name is required and must be a valid string.');
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.push('Email is required and must be a valid email address.');
    }

    if (!dateOfBirth || isNaN(Date.parse(dateOfBirth))) {
      errors.push('Date of birth is required and must be a valid date.');
    }

    if (parent) {
      if (!parent.firstName || typeof parent.firstName !== 'string' || parent.firstName.trim() === '') {
        errors.push('Parent first name is required.');
      }
      if (!parent.lastName || typeof parent.lastName !== 'string' || parent.lastName.trim() === '') {
        errors.push('Parent last name is required.');
      }
      if (!parent.relationship || typeof parent.relationship !== 'string' || parent.relationship.trim() === '') {
        errors.push('Parent relationship is required.');
      }
      if (!parent.phone || typeof parent.phone !== 'string' || parent.phone.trim() === '') {
        errors.push('Parent phone number is required.');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during student validation.',
    });
  }
}
