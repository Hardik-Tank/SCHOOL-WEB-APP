const asyncHandler = require('../utils/asyncHandler');
const School = require('../models/School');
const User = require('../models/User');

const listSchools = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const [schools, total] = await Promise.all([
    School.find(filter)
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    School.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: schools,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

const getSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id).populate('admin', 'name email');
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }

  if (req.user.role === 'school_admin' && String(req.user.school) !== String(school._id)) {
    res.status(403);
    throw new Error('Forbidden: not your school');
  }

  res.json({ success: true, data: school });
});

const approveSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }

  school.status = 'approved';
  school.approvedBy = req.user._id;
  school.approvedAt = new Date();
  await school.save();

  if (school.admin) {
    await User.findByIdAndUpdate(school.admin, { status: 'active' });
  }

  res.json({ success: true, data: school });
});

const rejectSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }

  school.status = 'rejected';
  await school.save();

  res.json({ success: true, data: school });
});

module.exports = { listSchools, getSchool, approveSchool, rejectSchool };
