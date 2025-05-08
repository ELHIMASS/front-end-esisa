const mongoose = require("mongoose");

const EvaluationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  weight: { type: Number, required: true },
  score: { type: Number, required: true },
  date: { type: Date, required: true }
});

const GradeSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  evaluations: [EvaluationSchema]
});

const AbsenceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  subject: { type: String, required: true },
  justified: { type: Boolean, default: false },
  comment: { type: String }
});

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  major: { type: String, required: true },
  role: { type: String, required: true },
  anne_scolaire: { type: String, required: true },
  date: { type: String, required: true }, // Birth date
  group: { type: String, required: true },
  sex: { type: String, required: true },
  tel: { type: String, required: true },
  absences: [AbsenceSchema],
  grades: [GradeSchema]
}, { timestamps: true });

module.exports = mongoose.model("Student", StudentSchema, "students");