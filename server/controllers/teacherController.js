const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Teacher = require('../models/Teacher');

const listTeachers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const teacherFilter = { school: req.user.school };
  let userIds = null;

  if (search) {
    const users = await User.find({
      school: req.user.school,
      role: 'teacher',
      $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }],
    }).select('_id');
    userIds = users.map((u) => u._id);
    teacherFilter.user = { $in: userIds };
  }

  const [teachers, total] = await Promise.all([
    Teacher.find(teacherFilter)
      .populate('user', 'name email phone status')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Teacher.countDocuments(teacherFilter),
  ]);

  res.json({
    success: true,
    data: teachers,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, phone, employeeId, subjects, qualification, joiningDate } = req.body;

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
    role: 'teacher',
    status: 'active',
    school: req.user.school,
  });

  try {
    const teacher = await Teacher.create({
      user: user._id,
      school: req.user.school,
      employeeId,
      subjects: subjects || [],
      qualification,
      joiningDate,
    });
    const populated = await teacher.populate('user', 'name email phone status');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    throw err;
  }
});

const findOwnTeacher = async (id, school) => {
  const teacher = await Teacher.findById(id);
  if (!teacher || String(teacher.school) !== String(school)) return null;
  return teacher;
};

const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await findOwnTeacher(req.params.id, req.user.school);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  await teacher.populate('user', 'name email phone status');
  res.json({ success: true, data: teacher });
});

const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await findOwnTeacher(req.params.id, req.user.school);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  const { name, phone, employeeId, subjects, qualification, joiningDate } = req.body;

  if (employeeId !== undefined) teacher.employeeId = employeeId;
  if (subjects !== undefined) teacher.subjects = subjects;
  if (qualification !== undefined) teacher.qualification = qualification;
  if (joiningDate !== undefined) teacher.joiningDate = joiningDate;
  await teacher.save();

  const userUpdate = {};
  if (name !== undefined) userUpdate.name = name;
  if (phone !== undefined) userUpdate.phone = phone;
  if (Object.keys(userUpdate).length > 0) {
    await User.findByIdAndUpdate(teacher.user, userUpdate);
  }

  await teacher.populate('user', 'name email phone status');
  res.json({ success: true, data: teacher });
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await findOwnTeacher(req.params.id, req.user.school);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  await User.findByIdAndDelete(teacher.user);
  await teacher.deleteOne();

  res.json({ success: true, data: { message: 'Teacher deleted' } });
});

module.exports = { listTeachers, createTeacher, getTeacher, updateTeacher, deleteTeacher };
