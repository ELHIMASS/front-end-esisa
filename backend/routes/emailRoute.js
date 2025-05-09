const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/send-email", upload.array("attachments"), async (req, res) => {
  const { recipients, subject, message } = req.body;
  const files = req.files;

  if (!recipients || !subject || !message) {
    return res.status(400).json({ error: "Données manquantes dans la requête." });
  }

  console.log("Body:", req.body);
  console.log("Fichiers:", req.files);

  let parsedRecipients = [];
  try {
    parsedRecipients = JSON.parse(recipients);
  } catch (err) {
    return res.status(400).json({ error: "Format des destinataires invalide." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ismail.elhimass@gmail.com",
        pass: "nyfevbmrinrawceq",
      },
    });

    const attachments = files?.map(file => ({
      filename: file.originalname || file.filename,
      path: file.path,
    })) || [];

    await transporter.sendMail({
      from: "ismail.elhimass@gmail.com",
      to: parsedRecipients.join(","),
      subject,
      text: message,
      attachments,
    });

    // Nettoyage des fichiers
    attachments.forEach(att => {
      try {
        fs.unlinkSync(att.path);
      } catch (err) {
        console.warn("Erreur suppression fichier:", att.path);
      }
    });

    res.json({ success: true, message: "Email envoyé avec pièces jointes." });
  } catch (error) {
    console.error("Erreur d'envoi email:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'e-mail." });
  }
});

module.exports = router;
