const express = require("express");
const router = express.Router();
const Prof = require("../models/Prof"); // Ajustez le chemin selon votre structure
const mongoose = require("mongoose");

// ✅ Route PUT pour modifier un professeur par ID
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            email,
            password,
            age,
            phone,
            matiere,
            role = "prof" // Valeur par défaut
        } = req.body;

        // Validation de l'ID (format MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "ID de professeur invalide",
                providedId: id
            });
        }

        // Chercher le professeur existant
        const existingProf = await Prof.findById(id);
        if (!existingProf) {
            return res.status(404).json({ 
                message: "Professeur non trouvé",
                searchedId: id
            });
        }

        // Vérifier l'unicité de l'email si il est modifié
        if (email && email !== existingProf.email) {
            const emailExists = await Prof.findOne({ email, _id: { $ne: id } });
            if (emailExists) {
                return res.status(409).json({ 
                    message: "Email déjà utilisé par un autre professeur",
                    existingProf: {
                        _id: emailExists._id,
                        name: emailExists.name,
                        email: emailExists.email
                    }
                });
            }
        }

        // Préparer les données à mettre à jour
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.password = password;
        if (age) updateData.age = age;
        if (phone) updateData.phone = phone;
        if (matiere) {
            // Vérifier que matiere est un tableau
            if (Array.isArray(matiere)) {
                updateData.matiere = matiere;
            } else {
                return res.status(400).json({
                    message: "Le champ 'matiere' doit être un tableau",
                    provided: typeof matiere
                });
            }
        }
        if (role) updateData.role = role;

        // Mise à jour du professeur
        const updatedProf = await Prof.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true, // Retourner le document mis à jour
                runValidators: true // Exécuter les validations du schéma
            }
        );

        // Réponse avec le professeur mis à jour (on exclut le mot de passe par sécurité)
        const profResponse = updatedProf.toObject();
        delete profResponse.password;

        res.status(200).json({ 
            message: "✅ Professeur modifié avec succès",
            professor: profResponse
        });

    } catch (error) {
        console.error("Erreur lors de la modification du professeur:", error);
        
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                message: "Erreur de validation des données",
                errors: error.errors
            });
        }

        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({
                message: "Format de données invalide",
                error: error.message
            });
        }

        res.status(500).json({ 
            message: "Erreur serveur lors de la modification du professeur",
            error: error.message 
        });
    }
});

module.exports = router;