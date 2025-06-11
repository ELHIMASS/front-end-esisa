const mongoose = require('mongoose');

const EvenementSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  titre: { type: String, required: true },
  description: { type: String, required: true }
});


const CalandrierSchema = new mongoose.Schema({
  
  semestres: {
    S1: [EvenementSchema],
    S2: [EvenementSchema],
    evenements: [EvenementSchema]
  },
 
});

module.exports = mongoose.model('calendrier', CalandrierSchema, 'calendrier');