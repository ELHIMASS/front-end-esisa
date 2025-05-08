const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

router.put("/", async (req, res) => {
  try {
    const { email, ...updateData } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const existingStudent = await Student.findOne({ email });
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Check if new email is already in use
    if (updateData.email && updateData.email !== email) {
      const studentWithNewEmail = await Student.findOne({ email: updateData.email });
      if (studentWithNewEmail) {
        return res.status(400).json({ message: "Email already in use by another student" });
      }
    }
    
    // Update simple fields
    const simpleFields = ['name', 'email', 'password', 'age', 'major', 'role', 
                         'anne_scolaire', 'date', 'group', 'sex', 'tel'];
    
    simpleFields.forEach(field => {
      if (updateData[field] !== undefined) {
        existingStudent[field] = updateData[field];
      }
    });
    
    // Handle absences updates
    if (updateData.absences && Array.isArray(updateData.absences)) {
      for (const newAbsence of updateData.absences) {
        if (!newAbsence.date || !newAbsence.subject) continue;
        
        // Find existing absence with same date and subject
        const existingIndex = existingStudent.absences.findIndex(
          absence => absence.date.getTime() === new Date(newAbsence.date).getTime() && 
                    absence.subject === newAbsence.subject
        );
        
        if (existingIndex >= 0) {
          // Update existing absence
          existingStudent.absences[existingIndex] = {
            ...existingStudent.absences[existingIndex],
            ...newAbsence,
            date: new Date(newAbsence.date),
            justified: newAbsence.justified !== undefined ? newAbsence.justified : false,
            comment: newAbsence.comment || ''
          };
        } else {
          // Add new absence
          existingStudent.absences.push({
            date: new Date(newAbsence.date),
            subject: newAbsence.subject,
            justified: newAbsence.justified || false,
            comment: newAbsence.comment || ''
          });
        }
      }
    }
    
    // Handle grades updates
    if (updateData.grades && Array.isArray(updateData.grades)) {
      for (const newGrade of updateData.grades) {
        if (!newGrade.subject || !newGrade.academicYear || !newGrade.semester) continue;
        
        // Find existing grade with same subject, academicYear and semester
        const existingIndex = existingStudent.grades.findIndex(
          grade => grade.subject === newGrade.subject && 
                  grade.academicYear === newGrade.academicYear && 
                  grade.semester === newGrade.semester
        );
        
        if (existingIndex >= 0) {
          // Update existing grade
          const existingGrade = existingStudent.grades[existingIndex];
          
          // Handle evaluations updates
          if (newGrade.evaluations && Array.isArray(newGrade.evaluations)) {
            for (const newEvaluation of newGrade.evaluations) {
              if (!newEvaluation.type || !newEvaluation.date) continue;
              
              const evalIndex = existingGrade.evaluations.findIndex(
                eval => eval.type === newEvaluation.type && 
                       eval.date.getTime() === new Date(newEvaluation.date).getTime()
              );
              
              if (evalIndex >= 0) {
                // Update existing evaluation
                existingGrade.evaluations[evalIndex] = {
                  ...existingGrade.evaluations[evalIndex],
                  ...newEvaluation,
                  date: new Date(newEvaluation.date),
                  weight: newEvaluation.weight || 0,
                  score: newEvaluation.score || 0
                };
              } else {
                // Add new evaluation
                existingGrade.evaluations.push({
                  type: newEvaluation.type,
                  date: new Date(newEvaluation.date),
                  weight: newEvaluation.weight || 0,
                  score: newEvaluation.score || 0
                });
              }
            }
          }
          
          // Update other grade fields
          existingStudent.grades[existingIndex] = {
            ...existingGrade,
            ...newGrade
          };
        } else {
          // Add new grade with required fields
          const gradeToAdd = {
            subject: newGrade.subject,
            academicYear: newGrade.academicYear,
            semester: newGrade.semester,
            evaluations: []
          };
          
          // Add evaluations if provided
          if (newGrade.evaluations && Array.isArray(newGrade.evaluations)) {
            gradeToAdd.evaluations = newGrade.evaluations.map(eval => ({
              type: eval.type || '',
              date: new Date(eval.date),
              weight: eval.weight || 0,
              score: eval.score || 0
            }));
          }
          
          existingStudent.grades.push(gradeToAdd);
        }
      }
    }
    
    // Save the updated student
    const updatedStudent = await existingStudent.save();
    
    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent
    });
    
  } catch (error) {
    console.error("Error updating student:", error);
    
    const errorResponse = {
      message: "Error updating student",
      error: error.message
    };
    
    if (error.name === 'ValidationError') {
      errorResponse.validationErrors = {};
      for (const [path, err] of Object.entries(error.errors)) {
        errorResponse.validationErrors[path] = err.message;
      }
    }
    
    res.status(500).json(errorResponse);
  }
});

module.exports = router;