// Question : Pourquoi séparer les routes dans différents fichiers ?
// Réponse : Pour une meilleure organisation du code, une maintenance plus facile et une meilleure lisibilité. Chaque fichier de routes gère un ensemble spécifique de fonctionnalités, ce qui évite d'avoir un seul fichier de routes trop volumineux et complexe.
// Question : Comment organiser les routes de manière cohérente ?
// Réponse : En regroupant les routes par ressource (par exemple, tous les chemins commençant par '/courses' dans un fichier courseRoutes.js), et en utilisant des noms de routes descriptifs (par exemple, /:id pour récupérer un cours par ID) et en utilisant une logique CRUD (Create, Read, Update, Delete) cohérente pour les actions courantes.

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Routes pour les cours
router.post('/', courseController.createCourse);
router.get('/:id', courseController.getCourse);
router.get('/stats', courseController.getCourseStats);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);
router.post('/filter', courseController.getCoursesByFilter);
router.get('/stats', courseController.getCourseStats);


module.exports = router;