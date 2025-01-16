
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Routes pour les étudiants
router.post('/', studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
router.post('/filter', studentController.getStudentsByFilter);
router.get('/stats', studentController.getStudentStats);
router.post('/:id/courses', studentController.enrollStudentForCourse);
router.delete('/:id/courses', studentController.unEnrollStudentFromCourse);


module.exports = router;