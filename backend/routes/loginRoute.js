const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Prof = require("../models/Prof");
const Admin = require("../models/Admin");

router.get("/", async (req, res) => {
    const { email, password } = req.query;

    
    if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    if (!email.includes('@')) {
        return res.status(400).json({ message: "Email invalide" });
    }
 
    const [student, prof, admin] = await Promise.all([
        Student.findOne({ email, password }).lean(),
        Prof.findOne({ email, password }).lean(),
        Admin.findOne({ email, password }).lean()
    ]);

    const user = student || prof || admin;

    if (!user) {
        return res.status(404).json({ message: "Aucun utilisateur trouvé avec ces identifiants" });
    }

    res.status(200).json({...user});

    
});

module.exports = router;