const express = require('express');
const { listClasses, createClass, getClass, updateClass, deleteClass } = require('../controllers/classController');
const { classValidator } = require('../validators/classValidators');
const validate = require('../validators/validate');
const { protect, authorize, scopeToSchool } = require('../middleware/auth');

const router = express.Router();

router.use(protect(), scopeToSchool);

router.get('/', authorize('school_admin', 'teacher', 'student'), listClasses);
router.post('/', authorize('school_admin'), classValidator, validate, createClass);
router.get('/:id', authorize('school_admin', 'teacher', 'student'), getClass);
router.put('/:id', authorize('school_admin'), classValidator, validate, updateClass);
router.delete('/:id', authorize('school_admin'), deleteClass);

module.exports = router;
