const mongoose = require('mongoose');

const schoolClassSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
  },
  { timestamps: true }
);

schoolClassSchema.index({ school: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('SchoolClass', schoolClassSchema);
