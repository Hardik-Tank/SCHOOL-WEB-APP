const express = require('express');
const {
  superAdminDashboard,
  schoolAdminDashboard,
  teacherDashboard,
  studentDashboard,
} = require('../controllers/dashboardController');
const { protect, authorize, scopeToSchool } = require('../middleware/auth');

const router = express.Router();

router.use(protect());

router.get('/super-admin', authorize('super_admin'), superAdminDashboard);
router.get('/school-admin', authorize('school_admin'), scopeToSchool, schoolAdminDashboard);
router.get('/teacher', authorize('teacher'), scopeToSchool, teacherDashboard);
router.get('/student', authorize('student'), scopeToSchool, studentDashboard);

module.exports = router;
