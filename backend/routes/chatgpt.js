const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/chatgpt", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt manquant" });
  }

  try {
    const response = await axios.post("http://127.0.0.1:11434/api/generate", {
  model: "llama3",
  prompt: prompt,
  stream: false,
});


    const generatedText = response.data?.response || "Aucune réponse générée";
    res.json({ response: generatedText });
  } catch (error) {
    console.error("❌ Erreur Ollama :", error?.response?.data || error.message || error);
    res.status(500).json({
      error: "Erreur lors de la réponse de Ollama",
      details: error?.response?.data || error.message,
    });
  }
});

module.exports = router;
