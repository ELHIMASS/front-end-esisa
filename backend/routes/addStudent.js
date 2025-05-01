const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// ✅ Route POST pour ajouter un étudiant
router.post("/", async (req, res) => {

    const {
        name,
        email,
        role,
        major,
        password,
        age,
        anne_scolaire,
        date,
        group,
        sex,
        tel
    } = req.body;

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
        return res.status(409).json({ message: "Email déjà utilisé" });
    }

    const newStudent = new Student({
        name,
        email,
        role,
        major,
        password,
        age,
        anne_scolaire,
        date,
        group,
        sex,
        tel
    });
    await newStudent.save();
    res.status(201).json({ message: "✅ Étudiant ajouté avec succès", student: newStudent });
});

module.exports = router;