const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "admin" },
    name: { type: String, required: true }
});

module.exports = mongoose.model("Admin", AdminSchema, "admins");