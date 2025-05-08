const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const mongoose = require("mongoose");

// ✅ Route POST pour ajouter un étudiant - Version corrigée selon le modèle
router.post("/", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            age,
            major,
            group,
            sex,
            tel,
            anne_scolaire,
            date,
            // Champs optionnels
            absences = [],
            grades = []
        } = req.body;

        // Validation des champs obligatoires
        if (!name || !email || !password || !age || !major || !group || !sex || !tel || !anne_scolaire || !date) {
            return res.status(400).json({ 
                message: "Tous les champs obligatoires doivent être fournis",
                requiredFields: ["name", "email", "password", "age", "major", "group", "sex", "tel", "anne_scolaire", "date"]
            });
        }

        // Vérification de l'unicité de l'email
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(409).json({ 
                message: "Email déjà utilisé",
                existingStudent: {
                    _id: existingStudent._id,
                    name: existingStudent.name,
                    email: existingStudent.email
                }
            });
        }

        // Création du nouvel étudiant selon le modèle exact
        const newStudent = new Student({
            name,
            email,
            password,
            age: Number(age),
            major,
            group,
            sex,
            tel,
            anne_scolaire,
            date,
            role: "student", // Valeur par défaut
            absences: Array.isArray(absences) ? absences : [],
            grades: Array.isArray(grades) ? grades : []
        });

        // Validation du schéma avant sauvegarde
        const validationError = newStudent.validateSync();
        if (validationError) {
            return res.status(400).json({
                message: "Erreur de validation",
                errors: validationError.errors
            });
        }

        // Sauvegarde dans la base de données
        const savedStudent = await newStudent.save();

        // Réponse avec l'étudiant créé (on exclut le mot de passe par sécurité)
        const studentResponse = savedStudent.toObject();
        delete studentResponse.password;

        res.status(201).json({ 
            message: "✅ Étudiant ajouté avec succès",
            student: studentResponse
        });

    } catch (error) {
        console.error("Erreur lors de l'ajout de l'étudiant:", error);
        
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                message: "Erreur de validation des données",
                errors: error.errors
            });
        }

        res.status(500).json({ 
            message: "Erreur serveur lors de l'ajout de l'étudiant",
            error: error.message 
        });
    }
});

module.exports = router;