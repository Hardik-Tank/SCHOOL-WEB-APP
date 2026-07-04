const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Student = require('../models/Student');

const listStudents = asyncHandler(async (req, res) => {
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'name email phone status')
      .populate('schoolClass', 'name');
    return res.json({ success: true, data: student ? [student] : [] });
  }

  const { page = 1, limit = 10, search, schoolClass } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const filter = { school: req.user.school };
  if (schoolClass) filter.schoolClass = schoolClass;

  if (search) {
    const users = await User.find({
      school: req.user.school,
      role: 'student',
      $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }],
    }).select('_id');
    filter.user = { $in: users.map((u) => u._id) };
  }

  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('user', 'name email phone status')
      .populate('schoolClass', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Student.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: students,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, phone, schoolClass, rollNumber, guardianName, guardianPhone, dob, admissionDate } =
    req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('Email already in use');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'student',
    status: 'active',
    school: req.user.school,
  });

  try {
    const student = await Student.create({
      user: user._id,
      school: req.user.school,
      schoolClass,
      rollNumber,
      guardianName,
      guardianPhone,
      dob,
      admissionDate,
    });
    await student.populate('user', 'name email phone status');
    await student.populate('schoolClass', 'name');
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    throw err;
  }
});

const findOwnStudent = async (id, school) => {
  const student = await Student.findById(id);
  if (!student || String(student.school) !== String(school)) return null;
  return student;
};

const getStudent = asyncHandler(async (req, res) => {
  if (req.user.role === 'student') {
    const own = await Student.findOne({ user: req.user._id });
    if (!own || String(own._id) !== String(req.params.id)) {
      res.status(403);
      throw new Error('Forbidden: not your record');
    }
    await own.populate('user', 'name email phone status');
    await own.populate('schoolClass', 'name');
    return res.json({ success: true, data: own });
  }

  const student = await findOwnStudent(req.params.id, req.user.school);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  await student.populate('user', 'name email phone status');
  await student.populate('schoolClass', 'name');
  res.json({ success: true, data: student });
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await findOwnStudent(req.params.id, req.user.school);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  const { name, phone, schoolClass, rollNumber, guardianName, guardianPhone, dob, admissionDate } = req.body;

  if (schoolClass !== undefined) student.schoolClass = schoolClass;
  if (rollNumber !== undefined) student.rollNumber = rollNumber;
  if (guardianName !== undefined) student.guardianName = guardianName;
  if (guardianPhone !== undefined) student.guardianPhone = guardianPhone;
  if (dob !== undefined) student.dob = dob;
  if (admissionDate !== undefined) student.admissionDate = admissionDate;
  await student.save();

  const userUpdate = {};
  if (name !== undefined) userUpdate.name = name;
  if (phone !== undefined) userUpdate.phone = phone;
  if (Object.keys(userUpdate).length > 0) {
    await User.findByIdAndUpdate(student.user, userUpdate);
  }

  await student.populate('user', 'name email phone status');
  await student.populate('schoolClass', 'name');
  res.json({ success: true, data: student });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const student = await findOwnStudent(req.params.id, req.user.school);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await User.findByIdAndDelete(student.user);
  await student.deleteOne();

  res.json({ success: true, data: { message: 'Student deleted' } });
});

module.exports = { listStudents, createStudent, getStudent, updateStudent, deleteStudent };
