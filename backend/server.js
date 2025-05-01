const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Import des routes
const studentRoutes = require("./routes/studentRoutes");
app.use("/api/students", studentRoutes);

const loginRoute = require("./routes/loginRoute");
app.use("/api/login", loginRoute);

const addStudentRoute = require("./routes/addStudent");
app.use("/api/add", addStudentRoute);



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

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));