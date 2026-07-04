const asyncHandler = require('../utils/asyncHandler');
const SchoolClass = require('../models/SchoolClass');

const listClasses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const filter = { school: req.user.school };

  const [classes, total] = await Promise.all([
    SchoolClass.find(filter)
      .populate('classTeacher', 'employeeId')
      .sort({ name: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    SchoolClass.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: classes,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

const createClass = asyncHandler(async (req, res) => {
  const { name, classTeacher } = req.body;

  const schoolClass = await SchoolClass.create({
    school: req.user.school,
    name,
    classTeacher: classTeacher || null,
  });

  res.status(201).json({ success: true, data: schoolClass });
});

const findOwnClass = async (id, school) => {
  const schoolClass = await SchoolClass.findById(id);
  if (!schoolClass || String(schoolClass.school) !== String(school)) return null;
  return schoolClass;
};

const getClass = asyncHandler(async (req, res) => {
  const schoolClass = await findOwnClass(req.params.id, req.user.school);
  if (!schoolClass) {
    res.status(404);
    throw new Error('Class not found');
  }
  res.json({ success: true, data: schoolClass });
});

const updateClass = asyncHandler(async (req, res) => {
  const schoolClass = await findOwnClass(req.params.id, req.user.school);
  if (!schoolClass) {
    res.status(404);
    throw new Error('Class not found');
  }

  const { name, classTeacher } = req.body;
  if (name !== undefined) schoolClass.name = name;
  if (classTeacher !== undefined) schoolClass.classTeacher = classTeacher || null;

  await schoolClass.save();
  res.json({ success: true, data: schoolClass });
});

const deleteClass = asyncHandler(async (req, res) => {
  const schoolClass = await findOwnClass(req.params.id, req.user.school);
  if (!schoolClass) {
    res.status(404);
    throw new Error('Class not found');
  }

  await schoolClass.deleteOne();
  res.json({ success: true, data: { message: 'Class deleted' } });
});

module.exports = { listClasses, createClass, getClass, updateClass, deleteClass };
