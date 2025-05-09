const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Professor = require("../models/Prof");

// ✅ Route POST pour ajouter un professeur
router.post("/", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            age,
            phone,
            matiere
        } = req.body;

        // Vérification des champs requis
        if (!name || !email || !password || !age || !phone || !matiere) {
            return res.status(400).json({
                message: "Tous les champs obligatoires doivent être fournis",
                requiredFields: ["name", "email", "password", "age", "phone", "matiere"]
            });
        }

        // Vérification unicité email
        const existingProf = await Professor.findOne({ email });
        if (existingProf) {
            return res.status(409).json({
                message: "Email déjà utilisé",
                existingProfessor: {
                    _id: existingProf._id,
                    name: existingProf.name,
                    email: existingProf.email
                }
            });
        }

        // Création du nouveau professeur
        const newProfessor = new Professor({
            _id: new mongoose.Types.ObjectId(),
            name,
            email,
            password,
            age,
            phone,
            matiere: Array.isArray(matiere) ? matiere : [matiere],
            role: "prof" // valeur par défaut dans le schéma
        });

        // Validation avant sauvegarde
        const validationError = newProfessor.validateSync();
        if (validationError) {
            return res.status(400).json({
                message: "Erreur de validation",
                errors: validationError.errors
            });
        }

        // Sauvegarde en base
        const savedProf = await newProfessor.save();

        // Ne pas exposer le mot de passe dans la réponse
        const profResponse = savedProf.toObject();
        delete profResponse.password;

        res.status(201).json({
            message: "✅ Professeur ajouté avec succès",
            professor: profResponse
        });

    } catch (error) {
        console.error("Erreur lors de l'ajout du professeur:", error);

        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                message: "Erreur de validation des données",
                errors: error.errors
            });
        }

        res.status(500).json({
            message: "Erreur serveur lors de l'ajout du professeur",
            error: error.message
        });
    }
});

module.exports = router;
