const { body } = require('express-validator');

const markAttendanceValidator = [
  body('schoolClass').isMongoId().withMessage('Valid schoolClass id is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('records').isArray({ min: 1 }).withMessage('Records must be a non-empty array'),
  body('records.*.student').isMongoId().withMessage('Each record needs a valid student id'),
  body('records.*.status')
    .isIn(['present', 'absent', 'leave'])
    .withMessage('Status must be present, absent or leave'),
];

module.exports = { markAttendanceValidator };
