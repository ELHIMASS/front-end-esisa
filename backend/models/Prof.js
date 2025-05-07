const mongoose = require("mongoose");

const ProfessorSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    role: { 
        type: String, 
        required: true, 
        default: "prof" 
    },
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    age: { 
        type: String,  
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    matiere: { 
        type: [String],  
        required: true 
    }
}, { collection: 'profs' });  

module.exports = mongoose.model("Prof", ProfessorSchema);