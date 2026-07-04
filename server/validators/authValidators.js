const { body } = require('express-validator');

const registerSchoolValidator = [
  body('schoolName').trim().notEmpty().withMessage('School name is required'),
  body('schoolAddress').optional().trim(),
  body('schoolPhone').optional().trim(),
  body('schoolEmail').isEmail().withMessage('Valid school email is required').normalizeEmail(),
  body('adminName').trim().notEmpty().withMessage('Admin name is required'),
  body('adminEmail').isEmail().withMessage('Valid admin email is required').normalizeEmail(),
  body('adminPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerSchoolValidator, loginValidator };
