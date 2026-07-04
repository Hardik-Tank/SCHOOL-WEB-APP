const asyncHandler = require('../utils/asyncHandler');
const School = require('../models/School');
const User = require('../models/User');
const SchoolClass = require('../models/SchoolClass');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

const todayRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

const superAdminDashboard = asyncHandler(async (req, res) => {
  const [totalSchools, pendingSchools, approvedSchools, rejectedSchools, totalUsers] = await Promise.all([
    School.countDocuments(),
    School.countDocuments({ status: 'pending' }),
    School.countDocuments({ status: 'approved' }),
    School.countDocuments({ status: 'rejected' }),
    User.countDocuments(),
  ]);

  res.json({
    success: true,
    data: { totalSchools, pendingSchools, approvedSchools, rejectedSchools, totalUsers },
  });
});

const schoolAdminDashboard = asyncHandler(async (req, res) => {
  const school = req.user.school;
  const { start, end } = todayRange();

  const [totalTeachers, totalStudents, totalClasses, todayRecords] = await Promise.all([
    Teacher.countDocuments({ school }),
    Student.countDocuments({ school }),
    SchoolClass.countDocuments({ school }),
    Attendance.find({ school, date: { $gte: start, $lt: end } }),
  ]);

  const present = todayRecords.filter((r) => r.status === 'present').length;
  const absent = todayRecords.filter((r) => r.status === 'absent').length;
  const leave = todayRecords.filter((r) => r.status === 'leave').length;
  const totalMarked = present + absent + leave;
  const todayAttendancePercent = totalMarked > 0 ? Math.round((present / totalMarked) * 10000) / 100 : 0;

  res.json({
    success: true,
    data: { totalTeachers, totalStudents, totalClasses, todayAttendancePercent },
  });
});

const teacherDashboard = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher record not found');
  }

  let myClasses = await SchoolClass.find({ school: req.user.school, classTeacher: teacher._id });
  if (myClasses.length === 0) {
    myClasses = await SchoolClass.find({ school: req.user.school });
  }
  const classIds = myClasses.map((c) => c._id);

  const myStudentsCount = await Student.countDocuments({ schoolClass: { $in: classIds } });

  const { start, end } = todayRange();
  const [todayMarkedCount, todayTotalStudents] = await Promise.all([
    Attendance.countDocuments({ schoolClass: { $in: classIds }, date: { $gte: start, $lt: end } }),
    Student.countDocuments({ schoolClass: { $in: classIds } }),
  ]);

  res.json({
    success: true,
    data: { myClassesCount: myClasses.length, myStudentsCount, todayMarkedCount, todayTotalStudents },
  });
});

const studentDashboard = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate('schoolClass', 'name');
  if (!student) {
    res.status(404);
    throw new Error('Student record not found');
  }

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const records = await Attendance.find({ student: student._id, date: { $gte: start, $lt: end } });
  const presentDays = records.filter((r) => r.status === 'present').length;
  const absentDays = records.filter((r) => r.status === 'absent').length;
  const leaveDays = records.filter((r) => r.status === 'leave').length;
  const total = records.length;
  const attendancePercent = total > 0 ? Math.round((presentDays / total) * 10000) / 100 : 0;

  const className = student.schoolClass ? student.schoolClass.name : '';

  res.json({
    success: true,
    data: { attendancePercent, presentDays, absentDays, leaveDays, className },
  });
});

module.exports = { superAdminDashboard, schoolAdminDashboard, teacherDashboard, studentDashboard };
