const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    cc: { type: Number, required: true },
    partiel: { type: Number, required: true },
    projet: { type: Number, required: true }
});

const StudentSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    role: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    group: { type: String, required: true },
    sex: { type: String, required: true },
    absences: { type: Number, default: 0 },
    grades: [GradeSchema],
    anne_scolaire: { type: String, required: true },
    date: { type: String, required: true },
    tel: { type: String, required: true }
});

module.exports = mongoose.model("Student", StudentSchema, "students");