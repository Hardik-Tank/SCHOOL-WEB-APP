const express = require('express');
const {
  listStudents,
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { createStudentValidator, updateStudentValidator } = require('../validators/studentValidators');
const validate = require('../validators/validate');
const { protect, authorize, scopeToSchool } = require('../middleware/auth');

const router = express.Router();

router.use(protect(), scopeToSchool);

router.get('/', authorize('school_admin', 'teacher', 'student'), listStudents);
router.post('/', authorize('school_admin'), createStudentValidator, validate, createStudent);
router.get('/:id', authorize('school_admin', 'student'), getStudent);
router.put('/:id', authorize('school_admin'), updateStudentValidator, validate, updateStudent);
router.delete('/:id', authorize('school_admin'), deleteStudent);

module.exports = router;
