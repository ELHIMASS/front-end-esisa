// ./routes/notifications.js

const express = require("express");
const router = express.Router();

router.post("/save-token", async (req, res) => {
  // Enregistrer le token push ici
  const { userId, token } = req.body;

  // Stockage dans une base temporaire (à adapter selon ta logique)
  if (!global.userTokens) global.userTokens = {};
  global.userTokens[userId] = token;

  console.log(`💾 Token enregistré pour ${userId} : ${token}`);
  res.status(200).json({ success: true });
});

module.exports = router;
