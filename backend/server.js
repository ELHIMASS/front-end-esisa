const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io"); 
const forgotpassword = require('./routes/forgotpassword');
const fs = require("fs");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const chatGptRoute = require('./routes/chatgpt');



// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));



// Multer config
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// MongoDB
const connectDB = async () => {
  console.log("🔗 Tentative de connexion à :", process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté");
  } catch (err) {
    console.error("❌ Erreur de connexion MongoDB :", err);
    process.exit(1);
  }
};
connectDB();

// Routes backend
app.get("/", (req, res) => res.send("🚀 API en ligne !"));

app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/login", require("./routes/loginRoute"));
app.use("/api/add", require("./routes/addStudent"));
app.use("/api/update", require("./routes/modifieStudent"));
app.use("/api", require("./routes/emailRoute"));
app.use("/api/addProf", require("./routes/addProf"));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/channels', require('./routes/channels'));
app.use('/api/chat', chatGptRoute);
app.use('/api', require('./routes/chatgpt'));
app.use('/api/forgotpassword', require('./routes/forgotpassword'));
app.use('/api/prof', require('./routes/profRoute'));




// Email (formulaire simple)
app.post('/send-email', async (req, res) => {
  try {
    const formData = req.body;
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const emailBody = `
Nouvelle candidature ESISA

Nom: ${formData.nom}
Prénom: ${formData.prenom}
Email: ${formData.email}
Téléphone: ${formData.telephone}
Date de naissance: ${formData.dateNaissance}
Adresse: ${formData.adresse}
Ville: ${formData.ville}
Niveau: ${formData.niveau}
Filière: ${formData.filiere}
Mathématiques: ${formData.notesBac.mathematiques}
Français: ${formData.notesBac.francais}
Moyenne générale: ${formData.notesBac.moyenneGenerale}

Lettre de motivation:
${formData.motivation}
`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.RECIPIENT_EMAIL || 'i.elhimass@esisa.ac.ma',
      subject: `Candidature ESISA - ${formData.nom} ${formData.prenom}`,
      text: emailBody
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Candidature envoyée avec succès" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de l'envoi de l'email", error: error.message });
  }
});

// Email avec pièces jointes
const { sendEmail } = require('./routes/email'); // 🔁 nouveau module

app.post('/send-email-with-attachments', upload.fields([
  { name: 'cin', maxCount: 1 },
  { name: 'relevesBac', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), async (req, res) => {
  try {
    // 🧪 Logger debug
    console.log("📩 Reçu depuis front:", {
      formData: req.body.formData,
      files: Object.keys(req.files),
    });

    // ✅ Parsing sécurisé
    const rawFormData = req.body.formData;
    const formData = typeof rawFormData === 'string' ? JSON.parse(rawFormData) : rawFormData;
    formData.notesBac = formData.notesBac || {};

    // 📎 Préparation des pièces jointes
    const attachments = [];
    if (req.files.cin) attachments.push({ filename: req.files.cin[0].originalname, path: req.files.cin[0].path });
    if (req.files.relevesBac) attachments.push({ filename: req.files.relevesBac[0].originalname, path: req.files.relevesBac[0].path });
    if (req.files.photo) attachments.push({ filename: req.files.photo[0].originalname, path: req.files.photo[0].path });

    // 📧 Construction du contenu
    const emailHtml = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
    <div style="max-width: 650px; margin: auto; background-color: #ffffff; border-radius: 10px; border: 1px solid #ddd; overflow: hidden;">
      <div style="background-color: #0A1F3A; padding: 20px;">
        <h1 style="color: #FFD700; margin: 0; text-align: center;">Nouvelle Candidature ESISA</h1>
      </div>

      <div style="padding: 20px; color: #333;">
        <h2 style="color: #0A1F3A; border-bottom: 1px solid #FFD700; padding-bottom: 5px;">🧑 Informations personnelles</h2>
        <p><strong>Nom :</strong> ${formData.nom}</p>
        <p><strong>Prénom :</strong> ${formData.prenom}</p>
        <p><strong>Email :</strong> ${formData.email}</p>
        <p><strong>Téléphone :</strong> ${formData.telephone}</p>
        <p><strong>Date de naissance :</strong> ${formData.dateNaissance}</p>
        <p><strong>Adresse :</strong> ${formData.adresse}</p>
        <p><strong>Ville :</strong> ${formData.ville}</p>

        <h2 style="color: #0A1F3A; border-bottom: 1px solid #FFD700; padding-bottom: 5px;">🎓 Informations académiques</h2>
        <p><strong>Niveau demandé :</strong> ${formData.niveau}</p>
        <p><strong>Filière :</strong> ${formData.filiere || "Non précisée"}</p>
        <p><strong>Mathématiques :</strong> ${formData.notesBac.mathematiques}</p>
        <p><strong>Français :</strong> ${formData.notesBac.francais}</p>
        <p><strong>Moyenne générale :</strong> ${formData.notesBac.moyenneGenerale}</p>

        <h2 style="color: #0A1F3A; border-bottom: 1px solid #FFD700; padding-bottom: 5px;">📝 Lettre de motivation</h2>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; border-left: 4px solid #FFD700;">
          <p style="white-space: pre-line; color: #333;">${formData.motivation.replace(/\n/g, "<br>")}</p>
        </div>
      </div>

      <div style="background-color: #0A1F3A; padding: 10px; text-align: center;">
        <p style="color: #ffffff; font-size: 12px; margin: 0;">
          Candidature transmise via l'application mobile officielle ESISA
        </p>
      </div>
    </div>
  </div>
`;

    // ✅ Envoi de l'e-mail
    await sendEmail({
      from: process.env.SMTP_USER,
      to: process.env.RECIPIENT_EMAIL || 'i.elhimass@esisa.ac.ma',
      subject: `Candidature ESISA - ${formData.nom} ${formData.prenom}`,
      html: emailHtml,
      attachments: attachments
    });

    // 🧹 Suppression des fichiers temporaires
    attachments.forEach(att =>
      fs.unlink(att.path, (err) => {
        if (err) console.error("❌ Erreur suppression fichier :", err);
      })
    );

    res.status(200).json({ success: true, message: "Candidature avec pièces jointes envoyée avec succès" });
  } catch (error) {
    console.error("❌ Erreur envoi candidature :", error);
    res.status(500).json({ success: false, message: "Erreur lors de l'envoi", error: error.message });
  }
});

// Ajout absence (corrigé)
app.put("/api/students/:id/absence", async (req, res) => {
  const { subject, date } = req.body;
  const { id } = req.params;
  try {
    const student = await require('./models/Student').findById(id);
    if (!student) return res.status(404).json({ message: "Étudiant non trouvé" });

    student.absences = (student.absences || 0) + 1;
    student.absenceRecords = student.absenceRecords || [];
    student.absenceRecords.push({ subject: subject || "matière inconnue", date: date ? new Date(date) : new Date() });

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de l'ajout de l'absence" });
  }
});

const Channel = require("./models/channel"); // adapte le chemin si besoin

io.on("connection", (socket) => {
  console.log("Nouvelle connexion socket");

  socket.on("joinChannel", ({ channelId }) => {
    socket.join(channelId);
  });


socket.on("sendMessage", async ({ channelId, message }) => {
  try {
    if (!message || typeof message !== 'object' || !message.content || !message.user) {
      console.warn("Message invalide non enregistré :", message);
      return;
    }

    await Channel.findOneAndUpdate(
      { name: channelId },
      { $push: { messages: message } },
      { new: true, upsert: true }
    );

    io.to(channelId).emit("receiveMessage", message);

    // 🔔 Notification push à tous les utilisateurs (exemple simplifié)
    const tokens = Object.values(userTokens); // ou filtrer ceux du canal
    const notifMessage = `${message.user} dans ${channelId} : ${message.content}`;
    await sendPushNotification(tokens, notifMessage);

  } catch (error) {
    console.error("Erreur lors de l'enregistrement du message :", error);
  }
});

  
  

  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté");
  });
});



console.log("SMTP_USER:", process.env.SMTP_USER);

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Serveur + WebSocket sur le port ${PORT}`));