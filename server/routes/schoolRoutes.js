const express = require('express');
const { listSchools, getSchool, approveSchool, rejectSchool } = require('../controllers/schoolController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect());

router.get('/', authorize('super_admin'), listSchools);
router.get('/:id', authorize('super_admin', 'school_admin'), getSchool);
router.patch('/:id/approve', authorize('super_admin'), approveSchool);
router.patch('/:id/reject', authorize('super_admin'), rejectSchool);

module.exports = router;
