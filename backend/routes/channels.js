const express = require('express');
const router = express.Router();
const Channel = require('../models/channel');

router.get('/:channelId/messages', async (req, res) => {
  try {
    const channel = await Channel.findOne({ name: req.params.channelId });
    res.json(channel ? channel.messages : []);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du chargement des messages" });
  }
});

module.exports = router;
