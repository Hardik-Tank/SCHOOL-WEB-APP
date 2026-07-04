const express = require('express');
const {
  markAttendance,
  getAttendance,
  getMyAttendance,
  getAttendanceSummary,
} = require('../controllers/attendanceController');
const { markAttendanceValidator } = require('../validators/attendanceValidators');
const validate = require('../validators/validate');
const { protect, authorize, scopeToSchool } = require('../middleware/auth');

const router = express.Router();

router.use(protect(), scopeToSchool);

router.get('/me', authorize('student'), getMyAttendance);
router.get('/summary', authorize('teacher', 'school_admin'), getAttendanceSummary);
router.post('/', authorize('teacher', 'school_admin'), markAttendanceValidator, validate, markAttendance);
router.get('/', authorize('teacher', 'school_admin'), getAttendance);

module.exports = router;
