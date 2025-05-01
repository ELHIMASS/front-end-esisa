const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    major: { type: String, required: true },
    password: { type: String, required: true },
    age: { type: Number, required: true }, // âge est un nombre
    anne_scolaire: { type: String, required: true },
    date: { type: String, required: true }, // format texte accepté pour date de naissance
    group: { type: String, required: true },
    sex: { type: String, required: true },
    tel: { type: String, required: true }
});

module.exports = mongoose.model("Student", StudentSchema, "students");

