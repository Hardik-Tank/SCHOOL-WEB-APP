const express = require('express');
const authRoutes = require('./authRoutes');
const schoolRoutes = require('./schoolRoutes');
const classRoutes = require('./classRoutes');
const teacherRoutes = require('./teacherRoutes');
const studentRoutes = require('./studentRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/schools', schoolRoutes);
router.use('/classes', classRoutes);
router.use('/teachers', teacherRoutes);
router.use('/students', studentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
