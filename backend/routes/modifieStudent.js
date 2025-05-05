
const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

router.put("/", async (req, res) => {
    const id = req.query.id;
    if (!id) {
        console.log("il faut un id pour moddifier");
    }
    try {
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

        // Vérifier si l'étudiant existe
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: "Étudiant non trouvé" });
        }

        // Vérifier si le nouvel email est déjà utilisé par un autre étudiant
        if (email !== student.email) {
            const existingStudent = await Student.findOne({ email });
            if (existingStudent) {
                return res.status(409).json({ message: "Email déjà utilisé par un autre étudiant" });
            }
        }

        // Mettre à jour l'étudiant
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            {
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
            },
            { new: true } // Retourne le document mis à jour
        );

        res.status(200).json({ message: "✅ Étudiant modifié avec succès", student: updatedStudent });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la modification de l'étudiant", error: error.message });
    }
});

module.exports = router;
