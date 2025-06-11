const express = require('express');
const router = express.Router();
const Calendrier = require('../models/calendrier');

// POST /api/calendrier - Ajouter un nouveau calendrier
router.post('/', async (req, res) => {
  try {
    const { S1, S2, evenements } = req.body;
    console.log("Données reçues pour le calendrier:", req.body);
    // Validation basique
    if (!S1 || !S2 || !evenements) {
      return res.status(400).json({ error: "Tous les champs (S1, S2, evenements) sont requis" });
    }

    const nouveauCalendrier = new Calendrier({
      semestres: {
        S1,
        S2,
        evenements
      }
    });

    const calendrierSauvegarde = await nouveauCalendrier.save();
    
    res.status(201).json({ 
      message: 'Calendrier ajouté avec succès',
      calendrier: calendrierSauvegarde
    });

  } catch (error) {
    console.error("Erreur lors de l'ajout du calendrier:", error);
    res.status(500).json({ 
      error: "Erreur serveur",
      details: error.message 
    });
  }
});

module.exports = router;