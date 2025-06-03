const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

// Route POST pour envoyer un email avec pièces jointes
router.post("/send-email", upload.array("attachments"), async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;
    const files = req.files;

    if (!recipients || !subject || !message) {
      return res.status(400).json({ error: "Données manquantes dans la requête." });
    }

    console.log("Body reçu:", req.body);
    console.log("Fichiers uploadés:", files);

    let parsedRecipients = [];
    try {
      parsedRecipients = JSON.parse(recipients);
      if (!Array.isArray(parsedRecipients)) {
        throw new Error("recipients doit être un tableau.");
      }
    } catch (err) {
      return res.status(400).json({ error: "Format des destinataires invalide." });
    }

    // Configuration du transporteur nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ismail.elhimass@gmail.com",
        pass: "nyfevbmrinrawceq", // 🔐 Mot de passe d’application
      },
    });

    // Préparation des pièces jointes
    const attachments = (files || []).map(file => ({
      filename: file.originalname,
      path: path.resolve(file.path),
    }));

    // Envoi de l’email
    await transporter.sendMail({
      from: `"Espace Professeur" <ismail.elhimass@gmail.com>`,
      to: parsedRecipients.join(","),
      subject: subject.trim(),
      text: message.trim(),
      attachments,
    });

    // Suppression des fichiers temporaires
    attachments.forEach(file => {
      fs.unlink(file.path, err => {
        if (err) console.warn("Erreur suppression fichier:", file.path);
      });
    });

    return res.status(200).json({ success: true, message: "Email envoyé avec succès." });
  } catch (err) {
    console.error("Erreur dans send-email:", err);
    return res.status(500).json({ error: "Erreur lors de l'envoi de l'e-mail." });
  }
});

module.exports = router;
