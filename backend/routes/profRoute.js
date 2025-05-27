const express = require("express");
const Prof = require("../models/Prof");

const router = express.Router();

// Route pour récupérer tous les professeurs
router.get("/", async (req, res) => {
    try {
        const professeurs = await Prof.find();
        res.json(professeurs);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;