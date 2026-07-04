const { body } = require('express-validator');

const createStudentValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim(),
  body('schoolClass').isMongoId().withMessage('Valid schoolClass id is required'),
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('guardianName').optional().trim(),
  body('guardianPhone').optional().trim(),
  body('dob').optional().isISO8601().withMessage('Invalid date of birth'),
  body('admissionDate').optional().isISO8601().withMessage('Invalid admission date'),
];

const updateStudentValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('schoolClass').optional().isMongoId().withMessage('Valid schoolClass id is required'),
  body('rollNumber').optional().trim(),
  body('guardianName').optional().trim(),
  body('guardianPhone').optional().trim(),
  body('dob').optional().isISO8601().withMessage('Invalid date of birth'),
  body('admissionDate').optional().isISO8601().withMessage('Invalid admission date'),
];

module.exports = { createStudentValidator, updateStudentValidator };
