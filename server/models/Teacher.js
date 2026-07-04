const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    employeeId: { type: String, default: '' },
    subjects: { type: [String], default: [] },
    qualification: { type: String, default: '' },
    joiningDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
