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
        tel,
        // Nouvelles propriétés
        absences,
        grades
    } = req.body;

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
        return res.status(409).json({ message: "Email déjà utilisé" });
    }

    // Structure par défaut pour les notes si non fournies
    const defaultGrades = [
        {
            subject: "Mathématiques",
            cc: 0,
            partiel: 0,
            projet: 0
        },
        {
            subject: "Physique",
            cc: 0,
            partiel: 0,
            projet: 0
        }
    ];

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
        tel,
        // Ajout des nouvelles propriétés avec valeurs par défaut si non fournies
        absences: absences || 0,
        grades: grades  || defaultGrades
    });

    await newStudent.save();
    res.status(201).json({ message: "✅ Étudiant ajouté avec succès", student: newStudent });
});

module.exports = router;