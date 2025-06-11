const Calendrier = require('../../models/calendrier');

// POST /api/calendrier - Créer un nouveau calendrier
module.exports = async (req, res) => {
  try {
    // Vérifier si un calendrier existe déjà
    const calendrierExistant = await Calendrier.findOne();
    if (calendrierExistant) {
      return res.status(400).json({ 
        message: 'Un calendrier existe déjà. Utilisez les routes spécifiques pour ajouter des événements.' 
      });
    }

    const { semestres } = req.body;

    // Créer un nouveau calendrier avec la structure par défaut
    const nouveauCalendrier = new Calendrier({
      semestres: {
        S1: semestres?.S1 || [],
        S2: semestres?.S2 || [],
        evenements: semestres?.evenements || []
      }
    });

    await nouveauCalendrier.save();

    res.status(201).json({
      message: 'Calendrier créé avec succès',
      data: nouveauCalendrier
    });
  } catch (error) {
    console.error('Erreur lors de la création du calendrier:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};