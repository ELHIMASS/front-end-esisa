const express = require('express');
const router = express.Router();
const Calendrier = require('../../models/calendrier');

// GET /api/calendrier/s2 - Récupérer tous les événements S2
router.get('/', async (req, res) => {
  try {
    const calendrier = await Calendrier.findOne();
    if (!calendrier) {
      return res.status(404).json({ message: 'Calendrier non trouvé' });
    }
    res.json(calendrier.semestres.S2 || []);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements S2:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST /api/calendrier/s2 - Ajouter un nouvel événement S2
router.post('/', async (req, res) => {
  try {
    const { date, titre, description } = req.body;
    
    if (!date || !titre || !description) {
      return res.status(400).json({ message: 'Date, titre et description sont requis' });
    }

    let calendrier = await Calendrier.findOne();
    if (!calendrier) {
      calendrier = new Calendrier({ semestres: { S1: [], S2: [], evenements: [] } });
    }

    const nouvelEvenement = {
      date: new Date(date),
      titre,
      description
    };

    calendrier.semestres.S2.push(nouvelEvenement);
    await calendrier.save();

    res.status(201).json({
      message: 'Événement S2 ajouté avec succès',
      evenement: nouvelEvenement
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'événement S2:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// PUT /api/calendrier/s2/:id - Modifier un événement S2
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, titre, description } = req.body;

    const calendrier = await Calendrier.findOne();
    if (!calendrier) {
      return res.status(404).json({ message: 'Calendrier non trouvé' });
    }

    const evenementIndex = calendrier.semestres.S2.findIndex(
      event => event._id.toString() === id
    );

    if (evenementIndex === -1) {
      return res.status(404).json({ message: 'Événement S2 non trouvé' });
    }

    // Mise à jour des champs fournis
    if (date) calendrier.semestres.S2[evenementIndex].date = new Date(date);
    if (titre) calendrier.semestres.S2[evenementIndex].titre = titre;
    if (description) calendrier.semestres.S2[evenementIndex].description = description;

    await calendrier.save();

    res.json({
      message: 'Événement S2 modifié avec succès',
      evenement: calendrier.semestres.S2[evenementIndex]
    });
  } catch (error) {
    console.error('Erreur lors de la modification de l\'événement S2:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// DELETE /api/calendrier/s2/:id - Supprimer un événement S2
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const calendrier = await Calendrier.findOne();
    if (!calendrier) {
      return res.status(404).json({ message: 'Calendrier non trouvé' });
    }

    const evenementIndex = calendrier.semestres.S2.findIndex(
      event => event._id.toString() === id
    );

    if (evenementIndex === -1) {
      return res.status(404).json({ message: 'Événement S2 non trouvé' });
    }

    calendrier.semestres.S2.splice(evenementIndex, 1);
    await calendrier.save();

    res.json({ message: 'Événement S2 supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement S2:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;