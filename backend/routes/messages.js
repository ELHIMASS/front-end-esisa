// routes/messages.js

const express = require('express');
const router = express.Router();
const Message = require('../models/message');

// Route pour créer un nouveau message
router.post('/', async (req, res) => {
  try {
    const { senderId, channelId, content, type } = req.body;

    const newMessage = new Message({
      sender: senderId,
      channel: channelId,
      content,
      type,
      createdAt: new Date()
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Erreur lors de la création du message :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
