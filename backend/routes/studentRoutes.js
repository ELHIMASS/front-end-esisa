const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

// Route pour récupérer tous les étudiants
router.get("/", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
