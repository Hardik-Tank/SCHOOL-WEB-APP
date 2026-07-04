const express = require('express');
const {
  listTeachers,
  createTeacher,
  getTeacher,
  updateTeacher,
  deleteTeacher,
} = require('../controllers/teacherController');
const { createTeacherValidator, updateTeacherValidator } = require('../validators/teacherValidators');
const validate = require('../validators/validate');
const { protect, authorize, scopeToSchool } = require('../middleware/auth');

const router = express.Router();

router.use(protect(), scopeToSchool, authorize('school_admin'));

router.get('/', listTeachers);
router.post('/', createTeacherValidator, validate, createTeacher);
router.get('/:id', getTeacher);
router.put('/:id', updateTeacherValidator, validate, updateTeacher);
router.delete('/:id', deleteTeacher);

module.exports = router;
