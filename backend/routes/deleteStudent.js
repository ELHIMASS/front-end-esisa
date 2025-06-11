const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const mongoose = require("mongoose");

// ✅ Route DELETE pour supprimer un étudiant par ID
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validation de l'ID (format MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "ID d'étudiant invalide",
                providedId: id
            });
        }

        // Chercher l'étudiant avant suppression pour vérification
        const studentToDelete = await Student.findById(id);
        if (!studentToDelete) {
            return res.status(404).json({ 
                message: "Étudiant non trouvé",
                searchedId: id
            });
        }

        // Supprimer l'étudiant
        const deletedStudent = await Student.findByIdAndDelete(id);

        // Réponse avec l'étudiant supprimé (on exclut le mot de passe par sécurité)
        const studentResponse = deletedStudent.toObject();
        delete studentResponse.password;

        res.status(200).json({ 
            message: "✅ Étudiant supprimé avec succès",
            deletedStudent: {
                _id: studentResponse._id,
                name: studentResponse.name,
                email: studentResponse.email,
                major: studentResponse.major,
                group: studentResponse.group
            }
        });

    } catch (error) {
        console.error("Erreur lors de la suppression de l'étudiant:", error);
        
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({
                message: "Format d'ID invalide",
                error: error.message
            });
        }

        res.status(500).json({ 
            message: "Erreur serveur lors de la suppression de l'étudiant",
            error: error.message 
        });
    }
});

module.exports = router;