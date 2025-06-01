const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/chatgpt", async (req, res) => {
  const { prompt } = req.body;
  console.log("📥 Prompt reçu :", prompt); // ⬅️ Ajout ici

  if (!prompt) {
    return res.status(400).json({ error: "Prompt manquant" });
  }

  try {
    const response = await axios.post("http://127.0.0.1:11434/api/generate", {
      model: "llama3",
      prompt: prompt,
      stream: false,
    });

    const generatedText = response?.data?.response?.trim();
    if (!generatedText) {
      return res.status(502).json({ response: "Réponse vide d'Einstein." });
    }

    res.json({ response: generatedText });
  } catch (error) {
    console.error("❌ Erreur Ollama :", error?.response?.data || error.message || error);
    res.status(500).json({
      response: "Einstein a eu un problème technique.",
      details: error?.response?.data || error.message,
    });
  }
});

module.exports = router;
