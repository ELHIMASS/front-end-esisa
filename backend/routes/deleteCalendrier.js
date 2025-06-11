const express = require("express");
const Calendrier = require("../models/calendrier");

const router = express.Router();

router.delete("/:annee", async (req, res) => {
    try {
        const calendrierSupprime = await Calendrier.findOneAndDelete({ annee: req.params.annee });
        if (!calendrierSupprime) {
            return res.status(404).json({ message: "Calendrier non trouvé" });
        }
        res.json({ message: "Calendrier supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;