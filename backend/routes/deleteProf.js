const express = require("express");
const router = express.Router();
const Prof = require("../models/Prof"); // Ajustez le chemin selon votre structure
const mongoose = require("mongoose");

// ✅ Route DELETE pour supprimer un professeur par ID
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validation de l'ID (format MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "ID de professeur invalide",
                providedId: id
            });
        }

        // Chercher le professeur avant suppression pour vérification
        const profToDelete = await Prof.findById(id);
        if (!profToDelete) {
            return res.status(404).json({ 
                message: "Professeur non trouvé",
                searchedId: id
            });
        }

        // Supprimer le professeur
        const deletedProf = await Prof.findByIdAndDelete(id);

        // Réponse avec le professeur supprimé (on exclut le mot de passe par sécurité)
        const profResponse = deletedProf.toObject();
        delete profResponse.password;

        res.status(200).json({ 
            message: "✅ Professeur supprimé avec succès",
            deletedProfessor: {
                _id: profResponse._id,
                name: profResponse.name,
                email: profResponse.email,
                matiere: profResponse.matiere,
                role: profResponse.role
            }
        });

    } catch (error) {
        console.error("Erreur lors de la suppression du professeur:", error);
        
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({
                message: "Format d'ID invalide",
                error: error.message
            });
        }

        res.status(500).json({ 
            message: "Erreur serveur lors de la suppression du professeur",
            error: error.message 
        });
    }
});

module.exports = router;