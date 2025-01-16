const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');
const mongoService = require('../services/mongoService');
const redisService = require('../services/redisService');

/**
 * Créer un nouvel étudiant.
 * @param {Request} req - La requête entrante.
 * @param {Response} res - La réponse à envoyer.
 */
async function createStudent(req, res) {
    try {
        const student = req.body;

        if (!student["firstName"] || !student["lastName"] || !student["email"]) {
            return res.status(400).json({ message: "Le prénom, le nom et l'email sont obligatoires." });
        }

        const collection = getDb().collection('students');
        const result = await mongoService.insertOne(collection, student);
        res.status(201).json({ message: "Étudiant créé avec succès.", studentId: result.insertedId });
    } catch (error) {
        console.error(`Erreur lors de la création de l'étudiant : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


/**
 * Récupérer les détails d'un étudiant par ID.
 * @param {Request} req - La requête entrante (doit contenir l'ID de l'étudiant).
 * @param {Response} res - La réponse à envoyer.
 */
async function getStudent(req, res) {
    try {
        const studentId = req.params.id;

        if (!ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: "ID d'étudiant invalide." });
        }

        // Chercher dans le cache
        const cachedStudent = await redisService.getCachedData(`student:${studentId}`);
        if (cachedStudent) {
            return res.status(200).json(cachedStudent);
        }

        const collection = getDb().collection('students');

        // Chercher dans la base de données
        const student = await mongoService.findOneById(collection, studentId);

        if (!student) {
            return res.status(404).json({ message: "Étudiant non trouvé." });
        }

        // Mettre en cache les résultats
        await redisService.cacheData(`student:${studentId}`, student, 3600);

        res.status(200).json(student);
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'étudiant : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


/**
 * Supprimer un étudiant par ID.
 * @param {Request} req - La requête entrante (doit contenir l'ID de l'étudiant).
 * @param {Response} res - La réponse à envoyer.
 */
async function deleteStudent(req, res) {
    try {
        const studentId = req.params.id;

        if (!ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: "ID d'étudiant invalide." });
        }

        const collection = getDb().collection('students');

        // Supprimer de la base de données
        const result = await mongoService.deleteOneById(collection, studentId);

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Étudiant non trouvé." });
        }

        // Supprimer du cache
        await redisService.deleteCache(`student:${studentId}`);

        res.status(200).json({ message: "Étudiant supprimé avec succès." });
    } catch (error) {
        console.error(`Erreur lors de la suppression de l'étudiant : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


/**
 * Récupérer tous les étudiants.
 * @param {Request} req - La requête entrante.
 * @param {Response} res - La réponse à envoyer.
 */
async function getAllStudents(req, res) {
    try {
        const collection = getDb().collection('students');

        // Chercher dans la base de données
        const students = await mongoService.findAll(collection);

        if (!students) {
            return res.status(404).json({ message: "Aucun étudiant trouvé." });
        }

        res.status(200).json(students);
    } catch (error) {
        console.error(`Erreur lors de la récupération des étudiants : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


/**
 * Modifier un étudiant par ID.
 * @param {Request} req - La requête entrante (doit contenir les nouvelles données de l'étudiant).
 * @param {Response} res - La réponse à envoyer.
 */
async function updateStudent(req, res) {
    try {
        const studentId = req.params.id;
        const updateData = req.body;

        if (!ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: "ID d'étudiant invalide." });
        }

        const collection = getDb().collection('students');

        // Mettre à jour dans la base de données
        const result = await mongoService.updateOneById(collection, studentId, updateData);

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Étudiant non trouvé." });
        }

        // Mettre à jour le cache
        await redisService.deleteCache(`student:${studentId}`);

        res.status(200).json({ message: "Étudiant mis à jour avec succès." });
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de l'étudiant : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


/**
 * Récupérer les étudiants selon un filtre donné.
 * @param {Request} req - La requête entrante (doit contenir les critères de filtre).
 * @param {Response} res - La réponse à envoyer.
 */
async function getStudentsByFilter(req, res) {
    try {
        const filter = req.body; // Les critères de filtre sont passés dans le corps de la requête.
        const collection = getDb().collection('students');

        // Récupérer les étudiants correspondant au filtre
        const students = await mongoService.findAll(collection, filter);

        if (!students) {
            return res.status(404).json({ message: "Aucun étudiant correspondant au filtre." });
        }

        res.status(200).json(students);
    } catch (error) {
        console.error(`Erreur lors de la récupération des étudiants avec filtre : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


/**
 * Ajouter un cours à un étudiant
 * @param {Request} req
 * @param {Response} res
 */
async function enrollStudentForCourse(req, res) {
    try {
        const studentId = req.params.id;
        const { courseId } = req.body;

        if (!ObjectId.isValid(studentId) || !ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "ID d'étudiant ou de cours invalide." });
        }

        const studentsCollection = getDb().collection('students');
        const coursesCollection = getDb().collection('courses');

        const student = await mongoService.findOneById(studentsCollection, studentId);
        const course = await mongoService.findOneById(coursesCollection, courseId);

        if (!student) {
            return res.status(404).json({ message: "Étudiant non trouvé." });
        }
        if (!course) {
            return res.status(404).json({ message: "Cours non trouvé." });
        }


        // Vérifier si le cours est déjà dans la liste des cours de l'étudiant
        if (student.courses && student.courses.includes(course._id)) {
            return res.status(409).json({ message: "L'étudiant est déjà inscrit à ce cours." });
        }


        const update = student.courses ? { $push: { courses: course._id } } : { $set: { courses: [course._id] } };
        const result = await mongoService.updateOneById(studentsCollection, studentId, update);

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Étudiant non trouvé." });
        }

        await redisService.deleteCache(`student:${studentId}`);

        res.status(200).json({ message: "Cours ajouté à l'étudiant avec succès." });
    } catch (error) {
        console.error(`Erreur lors de l'ajout du cours à l'étudiant : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}



/**
 * Retirer un cours à un étudiant
 * @param {Request} req
 * @param {Response} res
 */
async function unEnrollStudentFromCourse(req, res) {
    try {
        const studentId = req.params.id;
        const { courseId } = req.body;

        if (!ObjectId.isValid(studentId) || !ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "ID d'étudiant ou de cours invalide." });
        }

        const studentsCollection = getDb().collection('students');
        const coursesCollection = getDb().collection('courses');

        const student = await mongoService.findOneById(studentsCollection, studentId);
        const course = await mongoService.findOneById(coursesCollection, courseId);

        if (!student) {
            return res.status(404).json({ message: "Étudiant non trouvé." });
        }
        if (!course) {
            return res.status(404).json({ message: "Cours non trouvé." });
        }

        // Vérifier si le cours est dans la liste des cours de l'étudiant
        if (!student.courses || !student.courses.includes(course._id)) {
            return res.status(404).json({ message: "L'étudiant n'est pas inscrit à ce cours." });
        }

        const update = { $pull: { courses: course._id } };
        const result = await mongoService.updateOneById(studentsCollection, studentId, update);

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Étudiant non trouvé." });
        }

        await redisService.deleteCache(`student:${studentId}`);


        res.status(200).json({ message: "Cours retiré de l'étudiant avec succès." });
    } catch (error) {
        console.error(`Erreur lors du retrait du cours de l'étudiant : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


/**
 * Récupérer les statistiques des étudiants (nombre total d'étudiants, etc.).
 * @param {Request} req - La requête entrante.
 * @param {Response} res - La réponse à envoyer.
 */
async function getStudentStats(req, res) {
    try {
        const studentsCollection = getDb().collection('students');

        const totalStudents = await studentsCollection.countDocuments();

        res.status(200).json({
            totalStudents
        });
    } catch (error) {
        console.error(`Erreur lors de la récupération des statistiques des étudiants : ${error.message}`);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}



// Export des contrôleurs
module.exports = {
    createStudent,
    getStudent,
    deleteStudent,
    updateStudent,
    getAllStudents,
    getStudentsByFilter,
    enrollStudentForCourse,
    unEnrollStudentFromCourse,
    getStudentStats
};