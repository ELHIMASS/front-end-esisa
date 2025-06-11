const Calendrier = require('../../models/calendrier');

// GET /api/calendrier - Récupérer le calendrier complet
module.exports = async (req, res) => {
  try {
    const calendrier = await Calendrier.findOne();
    
    if (!calendrier) {
      return res.status(404).json({ 
        message: 'Aucun calendrier trouvé',
        data: {
          semestres: {
            S1: [],
            S2: [],
            evenements: []
          }
        }
      });
    }

    res.json({
      message: 'Calendrier récupéré avec succès',
      data: calendrier
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du calendrier:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};