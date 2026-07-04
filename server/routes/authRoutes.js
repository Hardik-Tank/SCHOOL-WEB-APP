const express = require('express');
const { registerSchool, login, getMe } = require('../controllers/authController');
const { registerSchoolValidator, loginValidator } = require('../validators/authValidators');
const validate = require('../validators/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register-school', registerSchoolValidator, validate, registerSchool);
router.post('/login', loginValidator, validate, login);
router.get('/me', protect({ allowInactive: true }), getMe);

module.exports = router;
