const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const School = require('../models/School');

const registerSchool = asyncHandler(async (req, res) => {
  const { schoolName, schoolAddress, schoolPhone, schoolEmail, adminName, adminEmail, adminPassword } = req.body;

  const existing = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('Email already in use');
  }

  const school = await School.create({
    name: schoolName,
    address: schoolAddress,
    phone: schoolPhone,
    email: schoolEmail,
    status: 'pending',
  });

  const admin = await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'school_admin',
    status: 'pending',
    school: school._id,
  });

  school.admin = admin._id;
  await school.save();

  res.status(201).json({
    success: true,
    data: { message: 'Registration submitted. Await Super Admin approval.' },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.status !== 'active') {
    res.status(403);
    if (user.role === 'school_admin' && user.status === 'pending') {
      throw new Error("Your school's registration is pending approval");
    }
    throw new Error('Account is not active');
  }

  if (['school_admin', 'teacher', 'student'].includes(user.role)) {
    const school = await School.findById(user.school);
    if (!school || school.status !== 'approved') {
      res.status(403);
      throw new Error("Your school's registration is pending approval");
    }
  }

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: user.school,
        phone: user.phone,
      },
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('school', 'name status');
  res.json({ success: true, data: user });
});

module.exports = { registerSchool, login, getMe };
