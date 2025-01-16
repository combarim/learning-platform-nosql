// Question : Quelle est la différence entre un contrôleur et une route ?
// Réponse : Un contrôleur gère la logique métier (traitement des données et appels aux services), tandis qu'une route est responsable de diriger les requêtes vers les contrôleurs appropriés.
// Question : Pourquoi séparer la logique métier des routes ?
// Réponse : Cela permet de mieux organiser le code, de le rendre plus facile à maintenir et à tester, et de favoriser la réutilisation de la logique métier dans plusieurs routes.

const { ObjectId } = require('mongodb');
const {getDb} = require('../config/db');
const mongoService = require('../services/mongoService');
const redisService = require('../services/redisService');


/**
 * Créer un nouveau cours.
 * @param {Request} req - La requête entrante.
 * @param {Response} res - La réponse à envoyer.
 */
async function createCourse(req, res) {
    try {
        const courseData = req.body;
        console.log(req.body);

        if (!courseData.title || !courseData.description) {
            return res.status(400).json({ message: "Le titre et la description sont obligatoires." });
        }

        const collection = getDb().collection('courses');
        const result = await mongoService.insertOne(collection, courseData);
        res.status(201).json({ message: "Cours créé avec succès.", courseId: result.insertedId });
    } catch (error) {
        console.error(`Erreur lors de la création du cours : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


/**
 * Récupérer les détails d'un cours par ID.
 * @param {Request} req - La requête entrante (doit contenir l'ID du cours).
 * @param {Response} res - La réponse à envoyer.
 */
async function getCourse(req, res) {
    try {
        const courseId = req.params.id;

        if (!ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "ID de cours invalide." });
        }

        // Chercher dans le cache
        const cachedCourse = await redisService.getCachedData(`course:${courseId}`);
        if (cachedCourse) {
            return res.status(200).json(cachedCourse);
        }

        const collection = getDb().collection('courses');

        // Chercher dans la base de données
        const course = await mongoService.findOneById(collection, courseId);

        if (!course) {
            return res.status(404).json({ message: "Cours non trouvé." });
        }

        // Mettre en cache les résultats
        await redisService.cacheData(`course:${courseId}`, course, 3600);

        res.status(200).json(course);
    } catch (error) {
        console.error(`Erreur lors de la récupération du cours : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


/**
 * Supprimer un cours par ID.
 * @param {Request} req - La requête entrante (doit contenir l'ID du cours).
 * @param {Response} res - La réponse à envoyer.
 */
async function deleteCourse(req, res) {
    try {
        const courseId = req.params.id;

        if (!ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "ID de cours invalide." });
        }

        const collection = getDb().collection('courses');

        // Supprimer de la base de données
        const result = await mongoService.deleteOneById(collection, courseId);

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Cours non trouvé." });
        }

        // Supprimer du cache
        await redisService.deleteCache(`course:${courseId}`);

        res.status(200).json({ message: "Cours supprimé avec succès." });
    } catch (error) {
        console.error(`Erreur lors de la suppression du cours : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


/**
 * Récupérer tous les cours.
 * @param {Request} req - La requête entrante.
 * @param {Response} res - La réponse à envoyer.
 */
async function getAllCourses(req, res) {
    try {
        const collection = getDb().collection('courses');

        // Chercher dans la base de données
        const courses = await mongoService.findAll(collection);

        if (!courses || courses.length === 0) {
            return res.status(404).json({ message: "Aucun cours trouvé." });
        }

        res.status(200).json(courses);
    } catch (error) {
        console.error(`Erreur lors de la récupération des cours : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


/**
 * Modifier un cours par ID.
 * @param {Request} req - La requête entrante (doit contenir les nouvelles données du cours).
 * @param {Response} res - La réponse à envoyer.
 */
async function updateCourse(req, res) {
    try {
        const courseId = req.params.id;
        const updateData = req.body;

        if (!ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "ID de cours invalide." });
        }

        const collection = getDb().collection('courses');

        // Mettre à jour dans la base de données
        const result = await mongoService.updateOneById(collection, courseId, updateData);

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Cours non trouvé." });
        }

        // Mettre à jour le cache
        await redisService.deleteCache(`course:${courseId}`);

        res.status(200).json({ message: "Cours mis à jour avec succès." });
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du cours : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


/**
 * Récupérer les cours selon un filtre donné.
 * @param {Request} req - La requête entrante (doit contenir les critères de filtre).
 * @param {Response} res - La réponse à envoyer.
 */
async function getCoursesByFilter(req, res) {
    try {
        const filter = req.body; // Les critères de filtre sont passés dans le corps de la requête.
        const collection = getDb().collection('courses');

        // Récupérer les cours correspondant au filtre
        const courses = await mongoService.findAll(collection, filter);

        if (!courses || courses.length === 0) {
            return res.status(404).json({ message: "Aucun cours correspondant au filtre." });
        }

        res.status(200).json(courses);
    } catch (error) {
        console.error(`Erreur lors de la récupération des cours avec filtre : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


/**
 * Récupérer les statistiques des cours (nombre total de cours, etc.).
 * @param {Request} req - La requête entrante.
 * @param {Response} res - La réponse à envoyer.
 */
async function getCourseStats(req, res) {
    try {
        const coursesCollection = getDb().collection('courses');
        const studentsCollection = getDb().collection('students');

        // 1. Nombre total de cours
        const totalCourses = await coursesCollection.countDocuments();

        // 2. Nombre d'étudiants par cours
        const courses = await mongoService.findAll(coursesCollection);
        const coursesWithStudentCounts = await Promise.all(courses.map(async (course) => {
            const studentCount = await studentsCollection.countDocuments({ courses: course._id });
            return { courseId: course._id, studentCount };
        }));

        // 3. Cours avec le plus d'étudiants
        let courseWithMostStudents = null;
        let maxStudents = 0;
        coursesWithStudentCounts.forEach(course => {
            if (course.studentCount > maxStudents) {
                maxStudents = course.studentCount;
                courseWithMostStudents = course;
            }
        });

        // 4. Moyenne d'étudiants par cours
        const totalStudents = coursesWithStudentCounts.reduce((sum, course) => sum + course.studentCount, 0);
        const averageStudentsPerCourse = totalCourses > 0 ? totalStudents / totalCourses : 0;

        // 5. Nombre total d'étudiants
        const totalStudentsRegistered = await studentsCollection.countDocuments();

        // 6. Cours sans étudiant
        const coursesWithoutStudents = coursesWithStudentCounts.filter(course => course.studentCount === 0).length;


        // Retourner les statistiques
        res.status(200).json({
            totalCourses,
            courseWithMostStudents,
            averageStudentsPerCourse,
            totalStudentsRegistered,
            coursesWithoutStudents
        });
    } catch (error) {
        console.error(`Erreur lors de la récupération des statistiques des cours : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}




// Export des contrôleurs
module.exports = {
    createCourse,
    getCourse,
    deleteCourse,
    updateCourse,
    getCoursesByFilter,
    getAllCourses,
    getCourseStats,
};










