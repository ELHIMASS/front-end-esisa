const express = require('express');
const router = express.Router();
const Calendrier = require('../../models/calendrier');

// GET /api/calendrier/evenement - Récupérer tous les événements
router.get('/', async (req, res) => {
  try {
    const calendrier = await Calendrier.findOne();
    if (!calendrier) {
      return res.status(404).json({ message: 'Calendrier non trouvé' });
    }
    res.json(calendrier.semestres.evenements || []);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST /api/calendrier/evenement - Ajouter un nouvel événement
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

    calendrier.semestres.evenements.push(nouvelEvenement);
    await calendrier.save();

    res.status(201).json({
      message: 'Événement ajouté avec succès',
      evenement: nouvelEvenement
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'événement:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// PUT /api/calendrier/evenement/:id - Modifier un événement
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, titre, description } = req.body;

    const calendrier = await Calendrier.findOne();
    if (!calendrier) {
      return res.status(404).json({ message: 'Calendrier non trouvé' });
    }

    const evenementIndex = calendrier.semestres.evenements.findIndex(
      event => event._id.toString() === id
    );

    if (evenementIndex === -1) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    // Mise à jour des champs fournis
    if (date) calendrier.semestres.evenements[evenementIndex].date = new Date(date);
    if (titre) calendrier.semestres.evenements[evenementIndex].titre = titre;
    if (description) calendrier.semestres.evenements[evenementIndex].description = description;

    await calendrier.save();

    res.json({
      message: 'Événement modifié avec succès',
      evenement: calendrier.semestres.evenements[evenementIndex]
    });
  } catch (error) {
    console.error('Erreur lors de la modification de l\'événement:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// DELETE /api/calendrier/evenement/:id - Supprimer un événement
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const calendrier = await Calendrier.findOne();
    if (!calendrier) {
      return res.status(404).json({ message: 'Calendrier non trouvé' });
    }

    const evenementIndex = calendrier.semestres.evenements.findIndex(
      event => event._id.toString() === id
    );

    if (evenementIndex === -1) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    calendrier.semestres.evenements.splice(evenementIndex, 1);
    await calendrier.save();

    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;