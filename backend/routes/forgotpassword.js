const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Student = require('../models/Student');
const Prof = require('../models/Prof');
const nodemailer = require('nodemailer');
require("dotenv").config();
const bcrypt = require('bcrypt');



// Modèle pour stocker les tokens de réinitialisation
const mongoose = require('mongoose');
const resetTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  role: { type: String, required: true }, // 'student', 'prof', ou 'admin'
  createdAt: { type: Date, default: Date.now, expires: 3600 } // Token expire après 1 heure
});

const ResetToken = mongoose.model('ResetToken', resetTokenSchema);

// Configurer le transporteur d'email
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});



// Route pour demander un email de réinitialisation
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Adresse email requise" });
    }

    // Chercher l'utilisateur dans les collections student et prof
    let user = await Student.findOne({ email });
    let role = 'student';
    
    if (!user) {
      user = await Prof.findOne({ email });
      role = 'prof';
    }
    
    // Vérifier admin s'il existe un modèle Admin
    try {
      if (!user && mongoose.modelNames().includes('Admin')) {
        const Admin = mongoose.model('Admin');
        user = await Admin.findOne({ email });
        role = 'admin';
      }
    } catch (err) {
      console.log('Modèle Admin non disponible:', err.message);
    }

    if (!user) {
      return res.status(404).json({ message: "Aucun compte n'est associé à cette adresse email" });
    }

    // Générer un token unique
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Sauvegarder le token dans la BD avec une expiration
    await ResetToken.findOneAndDelete({ email }); // Supprimer un ancien token s'il existe
    
    await new ResetToken({
      email,
      token: resetToken,
      role
    }).save();

    // URL de réinitialisation (ajustez l'URL selon votre configuration)
    
    
    
    
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword?token=${resetToken}`;
    
    // Envoyer l'email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'ESISA - Réinitialisation de mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background-color: #0A1F3A; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #FFD700; margin: 0;">ESISA</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
            <h2 style="color: #0A1F3A; margin-top: 0;">Réinitialisation de mot de passe</h2>
            <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte ESISA. Cliquez sur le bouton ci-dessous pour continuer :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4B72FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">Réinitialiser votre mot de passe</a>
            </div>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            <p>Ce lien expirera dans 1 heure pour des raisons de sécurité.</p>
            <p style="margin-bottom: 0;">L'équipe ESISA</p>
          </div>
          <div style="text-align: center; padding: 15px; color: #888; font-size: 12px;">
            <p>&copy; 2023 ESISA. Tous droits réservés.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Un email de réinitialisation a été envoyé" });
    
  } catch (error) {
    console.error('Erreur dans forgot-password:', error);
    res.status(500).json({ message: "Une erreur s'est produite", error: error.message });
  }
});

// Route pour vérifier si un token est valide
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ message: "Token manquant" });
    }
    
    const resetToken = await ResetToken.findOne({ token });
    
    if (!resetToken) {
      return res.status(404).json({ message: "Token invalide ou expiré" });
    }
    
    res.status(200).json({ message: "Token valide" });
    
  } catch (error) {
    console.error('Erreur dans verify-reset-token:', error);
    res.status(500).json({ message: "Une erreur s'est produite", error: error.message });
  }
});

// Route pour réinitialiser le mot de passe
router.post('/reset', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token et nouveau mot de passe requis" });
    }
    
    const resetToken = await ResetToken.findOne({ token });
    
    if (!resetToken) {
      return res.status(404).json({ message: "Token invalide ou expiré" });
    }
    
    // Récupérer l'utilisateur selon son rôle
    let user;
    if (resetToken.role === 'student') {
      user = await Student.findOne({ email: resetToken.email });
    } else if (resetToken.role === 'prof') {
      user = await Prof.findOne({ email: resetToken.email });
    } else if (resetToken.role === 'admin') {
      try {
        if (mongoose.modelNames().includes('Admin')) {
          const Admin = mongoose.model('Admin');
          user = await Admin.findOne({ email: resetToken.email });
        }
      } catch (err) {
        console.log('Modèle Admin non disponible:', err.message);
      }
    }
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();
    
    // Supprimer le token utilisé
    await ResetToken.deleteOne({ token });
    
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
    
  } catch (error) {
    console.error('Erreur dans reset-password:', error);
    res.status(500).json({ message: "Une erreur s'est produite", error: error.message });
  }
});

module.exports = router;