const asyncHandler = require('../utils/asyncHandler');
const Attendance = require('../models/Attendance');
const SchoolClass = require('../models/SchoolClass');
const Student = require('../models/Student');

// normalize to midnight UTC of the calendar day so (student, date) stays
// a stable unique key regardless of what time-of-day a request arrives at
const normalizeDate = (input) => {
  const d = new Date(input);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const markAttendance = asyncHandler(async (req, res) => {
  const { schoolClass, date, records } = req.body;

  const classDoc = await SchoolClass.findById(schoolClass);
  if (!classDoc || String(classDoc.school) !== String(req.user.school)) {
    res.status(404);
    throw new Error('Class not found');
  }

  const studentIds = records.map((r) => r.student);
  const students = await Student.find({ _id: { $in: studentIds } });
  if (students.length !== new Set(studentIds).size) {
    res.status(400);
    throw new Error('One or more students not found');
  }
  const invalid = students.find((s) => String(s.schoolClass) !== String(schoolClass));
  if (invalid) {
    res.status(400);
    throw new Error('One or more students do not belong to this class');
  }

  const normalizedDate = normalizeDate(date);

  const results = await Promise.all(
    records.map((r) =>
      Attendance.findOneAndUpdate(
        { student: r.student, date: normalizedDate },
        {
          school: req.user.school,
          schoolClass,
          student: r.student,
          date: normalizedDate,
          status: r.status,
          markedBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  res.json({ success: true, data: results });
});

const getAttendance = asyncHandler(async (req, res) => {
  const { schoolClass, date } = req.query;
  if (!schoolClass || !date) {
    res.status(400);
    throw new Error('schoolClass and date are required');
  }

  const classDoc = await SchoolClass.findById(schoolClass);
  if (!classDoc || String(classDoc.school) !== String(req.user.school)) {
    res.status(404);
    throw new Error('Class not found');
  }

  const normalizedDate = normalizeDate(date);

  const students = await Student.find({ schoolClass }).populate('user', 'name email');
  const records = await Attendance.find({ schoolClass, date: normalizedDate });
  const byStudent = new Map(records.map((r) => [String(r.student), r]));

  const roster = students.map((s) => {
    const record = byStudent.get(String(s._id));
    return {
      student: s._id,
      name: s.user?.name,
      rollNumber: s.rollNumber,
      status: record ? record.status : null,
      attendanceId: record ? record._id : null,
    };
  });

  res.json({ success: true, data: roster });
});

const getMyAttendance = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student record not found');
  }

  const now = new Date();
  const month = parseInt(req.query.month, 10) || now.getUTCMonth() + 1;
  const year = parseInt(req.query.year, 10) || now.getUTCFullYear();

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const records = await Attendance.find({
    student: student._id,
    date: { $gte: start, $lt: end },
  }).sort({ date: 1 });

  const summary = { present: 0, absent: 0, leave: 0, total: records.length, percentage: 0 };
  records.forEach((r) => {
    summary[r.status] += 1;
  });
  summary.percentage = summary.total > 0 ? Math.round((summary.present / summary.total) * 10000) / 100 : 0;

  res.json({ success: true, data: { records, summary } });
});

const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { schoolClass, from, to } = req.query;
  if (!schoolClass || !from || !to) {
    res.status(400);
    throw new Error('schoolClass, from and to are required');
  }

  const classDoc = await SchoolClass.findById(schoolClass);
  if (!classDoc || String(classDoc.school) !== String(req.user.school)) {
    res.status(404);
    throw new Error('Class not found');
  }

  const start = normalizeDate(from);
  const end = normalizeDate(to);
  end.setUTCDate(end.getUTCDate() + 1);

  const records = await Attendance.find({
    schoolClass,
    date: { $gte: start, $lt: end },
  });

  const byDate = new Map();
  records.forEach((r) => {
    const key = r.date.toISOString().slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, { date: key, present: 0, absent: 0, leave: 0 });
    byDate.get(key)[r.status] += 1;
  });

  const summary = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));

  res.json({ success: true, data: summary });
});

module.exports = { markAttendance, getAttendance, getMyAttendance, getAttendanceSummary };
