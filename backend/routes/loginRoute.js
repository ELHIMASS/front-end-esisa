const express = require("express");
const router = express.Router();
const Student = require("../models/Student"); // Assure-toi que ce fichier existe


router.get("/", async (req, res) => {
    const email = req.query.email;
    const password = req.query.password;


    if (!email || !password) {
        return res.status(400).json({ message: "Email ou mot de passe manquant" });
    }


    if (!email.includes('@')) {
        return res.status(400).json({ message: "Email invalide" });
    }


    const students = await Student.find({ email, password });

    if (students.length === 0) {
        return res.status(404).json({ message: "Aucun étudiant correspondant" });
    }

    const student = students[0];
    res.status(200).json(student);


});

module.exports = router;
