const { body } = require('express-validator');

const classValidator = [
  body('name').trim().notEmpty().withMessage('Class name is required'),
  body('classTeacher').optional({ nullable: true }).isMongoId().withMessage('Invalid classTeacher id'),
];

module.exports = { classValidator };
