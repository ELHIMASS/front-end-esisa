const express = require('express');
const router = express.Router();

// Import des sous-routes
const evenementRoutes = require('./calandrier/evenementRoutes');
const s1Routes = require('./calandrier/s1Routes');
const s2Routes = require('./calandrier/s2Routes');

// Routes principales
router.use('/evenement', evenementRoutes);
router.use('/s1', s1Routes);
router.use('/s2', s2Routes);

// Route pour récupérer tout le calendrier
router.get('/', require('./calandrier/getCalendrier'));

// Route pour créer un nouveau calendrier
router.post('/', require('./calandrier/createCalendrier'));

module.exports = router;