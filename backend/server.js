const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();


const app = express();

// Configure middleware for handling multipart form data
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure file storage for attachments
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max file size
});

// Import des routes
const studentRoutes = require("./routes/studentRoutes");
app.use("/api/students", studentRoutes);

const loginRoute = require("./routes/loginRoute");
app.use("/api/login", loginRoute);

const addStudentRoute = require("./routes/addStudent");
app.use("/api/add", addStudentRoute);


const updateStudentRoute = require("./routes/modifieStudent");
app.use("/api/update", updateStudentRoute);

// Fonction asynchrone pour connecter à MongoDB
const connectDB = async () => {
  console.log("🔗 Tentative de connexion à :", process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté");
  } catch (err) {
    console.error("❌ Erreur de connexion MongoDB :", err);
    process.exit(1); // Quitte le serveur si la connexion échoue
  }
};

// Appel de la fonction de connexion
connectDB();

// Route test
app.get("/", (req, res) => {
  res.send("🚀 API en ligne !");
});

// Route for handling application form submissions
app.post('/send-email', async (req, res) => {
  try {
    console.log("Received form submission request");
    
    // Access form data
    const formData = req.body;
    console.log("Form data received:", formData);

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    // Format the email body
    const emailBody = `
Nouvelle candidature ESISA

Informations personnelles:
-------------------------
Nom: ${formData.nom}
Prénom: ${formData.prenom}
Email: ${formData.email}
Téléphone: ${formData.telephone}
Date de naissance: ${formData.dateNaissance}
Adresse: ${formData.adresse}
Ville: ${formData.ville}

Informations académiques:
------------------------
Niveau d'entrée souhaité: ${formData.niveau}
Filière: ${formData.filiere}

Notes au Baccalauréat:
---------------------
Mathématiques: ${formData.notesBac.mathematiques}
Français: ${formData.notesBac.francais}
Moyenne générale: ${formData.notesBac.moyenneGenerale}

Lettre de motivation:
-------------------
${formData.motivation}
    `;

    // Configure email options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.RECIPIENT_EMAIL || 'i.elhimass@esisa.ac.ma',
      subject: `Candidature ESISA - ${formData.nom} ${formData.prenom}`,
      text: emailBody,
      // We'll handle attachments later when implementing file upload
    };

    console.log("Sending email to:", mailOptions.to);
    
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    
    res.status(200).json({ 
      success: true, 
      message: "Candidature envoyée avec succès" 
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'envoi de l'email", 
      error: error.message 
    });
  }
});

// Function to handle file submissions with attachments
app.post('/send-email-with-attachments', upload.fields([
  { name: 'cin', maxCount: 1 },
  { name: 'relevesBac', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("Received form with attachments");
    
    // Extract form data
    const formData = JSON.parse(req.body.formData);
    console.log("Form data:", formData);
    
    // Get file paths
    const attachments = [];
    
    if (req.files.cin) {
      attachments.push({
        filename: req.files.cin[0].originalname,
        path: req.files.cin[0].path
      });
    }
    
    if (req.files.relevesBac) {
      attachments.push({
        filename: req.files.relevesBac[0].originalname,
        path: req.files.relevesBac[0].path
      });
    }
    
    if (req.files.photo) {
      attachments.push({
        filename: req.files.photo[0].originalname,
        path: req.files.photo[0].path
      });
    }
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    // Format the email body
    const emailBody = `
Nouvelle candidature ESISA

Informations personnelles:
-------------------------
Nom: ${formData.nom}
Prénom: ${formData.prenom}
Email: ${formData.email}
Téléphone: ${formData.telephone}
Date de naissance: ${formData.dateNaissance}
Adresse: ${formData.adresse}
Ville: ${formData.ville}

Informations académiques:
------------------------
Niveau d'entrée souhaité: ${formData.niveau}
Filière: ${formData.filiere}

Notes au Baccalauréat:
---------------------
Mathématiques: ${formData.notesBac.mathematiques}
Français: ${formData.notesBac.francais}
Moyenne générale: ${formData.notesBac.moyenneGenerale}

Lettre de motivation:
-------------------
${formData.motivation}
    `;

    // Configure email options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.RECIPIENT_EMAIL || 'i.elhimass@esisa.ac.ma',
      subject: `Candidature ESISA - ${formData.nom} ${formData.prenom}`,
      html: `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <div style="text-align: center; padding-bottom: 20px;">
      <img src="C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/images/icon.png" alt="ESISA" style="max-height: 60px;" />
      <h2 style="color: #0A1F3A;">Nouvelle candidature reçue</h2>
    </div>
    <hr style="border: none; border-top: 1px solid #ddd;" />

    <h3 style="color: #1A3F6F;">📋 Informations personnelles</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td><strong>Nom :</strong></td><td>${formData.nom}</td></tr>
      <tr><td><strong>Prénom :</strong></td><td>${formData.prenom}</td></tr>
      <tr><td><strong>Email :</strong></td><td>${formData.email}</td></tr>
      <tr><td><strong>Téléphone :</strong></td><td>${formData.telephone}</td></tr>
      <tr><td><strong>Date de naissance :</strong></td><td>${formData.dateNaissance}</td></tr>
      <tr><td><strong>Adresse :</strong></td><td>${formData.adresse}</td></tr>
      <tr><td><strong>Ville :</strong></td><td>${formData.ville}</td></tr>
    </table>

    <h3 style="color: #1A3F6F;">🎓 Informations académiques</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td><strong>Niveau :</strong></td><td>${formData.niveau}</td></tr>
      <tr><td><strong>Filière :</strong></td><td>${formData.filiere}</td></tr>
    </table>

    <h3 style="color: #1A3F6F;">📊 Notes au Bac</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td><strong>Mathématiques :</strong></td><td>${formData.notesBac.mathematiques}</td></tr>
      <tr><td><strong>Français :</strong></td><td>${formData.notesBac.francais}</td></tr>
      <tr><td><strong>Moyenne générale :</strong></td><td>${formData.notesBac.moyenneGenerale}</td></tr>
    </table>

    <h3 style="color: #1A3F6F;">📝 Lettre de motivation</h3>
    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #0A1F3A; font-style: italic;">
      ${formData.motivation.replace(/\n/g, '<br/>')}
    </div>

    <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
      Ce message a été envoyé automatiquement depuis le formulaire de candidature de l'ESISA.
    </p>
  </div>
`
,
      attachments: attachments
    };
    
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Email with attachments sent successfully");
    
    // Clean up temporary files
    attachments.forEach(attachment => {
      fs.unlink(attachment.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    });
    
    res.status(200).json({ 
      success: true, 
      message: "Candidature avec pièces jointes envoyée avec succès" 
    });
  } catch (error) {
    console.error("Error sending email with attachments:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'envoi de l'email avec pièces jointes", 
      error: error.message 
    });
  }
});
console.log("SMTP_USER:", process.env.SMTP_USER);

app.put("/api/students/:id/absence", async (req, res) => {
    const { subject, date } = req.body;
    const { id } = req.params;
  
    try {
      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({ message: "Étudiant non trouvé" });
      }
  
      // Initialisation si absences n'existe pas
      if (typeof student.absences !== 'number') {
        student.absences = 0;
      }
  
      // Incrémenter le compteur d'absences
      student.absences += 1;
  
      // Initialisation si absenceRecords n'existe pas
      if (!Array.isArray(student.absenceRecords)) {
        student.absenceRecords = [];
      }
  
      // Ajouter un enregistrement d'absence
      student.absenceRecords.push({
        subject: subject || "matière inconnue",
        date: date ? new Date(date) : new Date()
      });
  
      await student.save();
  
      res.json(student);
    } catch (error) {
      console.error("Erreur ajout absence:", error);
      res.status(500).json({ message: "Erreur serveur lors de l'ajout de l'absence" });
    }
  });

  // 🔽 Importer ta route email
const emailRoutes = require("./routes/emailRoute");

// 🔽 Utiliser la route (chemin complet sera /api/send-email)
app.use("/api", emailRoutes);

const profRoutes = require("./routes/addProf");
app.use("/api/addProf", profRoutes);



// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));