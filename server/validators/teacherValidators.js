const { body } = require('express-validator');

const createTeacherValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim(),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('subjects').optional().isArray().withMessage('Subjects must be an array'),
  body('qualification').optional().trim(),
  body('joiningDate').optional().isISO8601().withMessage('Invalid joining date'),
];

const updateTeacherValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('employeeId').optional().trim(),
  body('subjects').optional().isArray().withMessage('Subjects must be an array'),
  body('qualification').optional().trim(),
  body('joiningDate').optional().isISO8601().withMessage('Invalid joining date'),
];

module.exports = { createTeacherValidator, updateTeacherValidator };
