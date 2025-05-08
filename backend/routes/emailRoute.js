const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

// POST /api/send-email
router.post("/send-email", async (req, res) => {
  const { recipients, subject, message } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "Aucun destinataire fourni." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ismail.elhimass@gmail.com",
        pass: "nyfevbmrinrawceq" // utilise un mot de passe d'application ou dotenv
      }
    });

    await transporter.sendMail({
      from: "ismail.elhimass@gmail.com",
      to: recipients.join(","), // array to string
      subject,
      text: message
    });

    res.json({ success: true, message: "Email envoyé avec succès !" });
  } catch (error) {
    console.error("Erreur d'envoi email:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'e-mail." });
  }
});

module.exports = router;
