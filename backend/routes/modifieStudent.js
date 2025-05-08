const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

router.put("/", async (req, res) => {
  try {
    const { email, ...updateData } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Vérification de l'unicité de l'email
    if (updateData.email) {
      const existingStudent = await Student.findOne({ email: updateData.email });
      if (existingStudent && existingStudent.email !== email) {
        return res.status(400).json({ message: "Email already in use by another student" });
      }
    }

    // Récupération et fusion des données
    const existingStudent = await Student.findOne({ email });
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const mergedData = {
      ...existingStudent.toObject(),
      ...updateData,
      grades: mergeArrays(existingStudent.grades, updateData.grades),
      absences: mergeArrays(existingStudent.absences, updateData.absences)
    };

    // Mise à jour avec validation
    const updatedStudent = await Student.findOneAndUpdate(
      { email: email },
      { $set: mergedData },
      { 
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found after update" });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent
    });

  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ 
      message: "Error updating student",
      error: error.message,
      ...(error.name === 'ValidationError' && { validationErrors: error.errors })
    });
  }
});

// Helper function pour fusionner les tableaux
function mergeArrays(existing = [], incoming = []) {
  const merged = [...existing];
  
  incoming?.forEach(newItem => {
    const existingIndex = existing.findIndex(
      item => item.subject === newItem.subject
    );
    
    if (existingIndex >= 0) {
      merged[existingIndex] = { ...merged[existingIndex], ...newItem };
    } else {
      merged.push(newItem);
    }
  });

  return merged;
}

module.exports = router;