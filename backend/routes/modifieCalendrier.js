const express = require("express");
const Calendrier = require("../models/calendrier");

const router = express.Router();

router.put("/:annee", async (req, res) => {
    try {
        const calendrierMisAJour = await Calendrier.findOneAndUpdate(
            { annee: req.params.annee },
            req.body,
            { new: true, runValidators: true }
        );
        if (!calendrierMisAJour) {
            return res.status(404).json({ message: "Calendrier non trouvé" });
        }
        res.json(calendrierMisAJour);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la modification" });
    }
});

module.exports = router;