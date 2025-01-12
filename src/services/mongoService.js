// Question : Pourquoi créer des services séparés ?
// Réponse : Créer des services séparés permet d'organiser le code, de favoriser la réutilisation, et de faciliter la maintenance.
// Cela aide également à isoler la logique d'accès aux données des autres parties de l'application, comme les routes ou les contrôleurs.

const { ObjectId, Collection } = require('mongodb');


/**
 * Recherche un document par son ID dans une collection.
 * @param {Collection} collection - La collection.
 * @param {string} id - L'ID du document à rechercher.
 * @returns {Promise<Object|null>} - Le document trouvé ou null si aucun document ne correspond.
 */
async function findOneById(collection, id) {
    try {
        const objectId = new ObjectId(id);
        return await collection.findOne({_id: objectId});
    } catch (error) {
        console.error(`Erreur lors de la recherche par ID: ${error.message}`);
        throw error;
    }
}


/**
 * Insère un nouveau document dans une collection.
 * @param {Collection} collection - La collection.
 * @param {Object} data - Les données à insérer.
 * @returns {Promise<Object>} - Le résultat de l'insertion.
 */
async function insertOne(collection, data) {
    try {
        return await collection.insertOne(data);
    } catch (error) {
        console.error(`Erreur lors de l'insertion: ${error.message}`);
        throw error;
    }
}


/**
 * Met à jour un document par son ID dans une collection.
 * @param {Collection} collection - La collection.
 * @param {string} id - L'ID du document à mettre à jour.
 * @param {Object} updates - Les champs à mettre à jour.
 * @returns {Promise<Object>} - Le résultat de la mise à jour.
 */
async function updateOneById(collection, id, updates) {
    try {
        const objectId = new ObjectId(id);
        return await collection.updateOne({_id: objectId}, {$set: updates});
    } catch (error) {
        console.error(`Erreur lors de la mise à jour: ${error.message}`);
        throw error;
    }
}


/**
 * Supprime un document par son ID dans une collection.
 * @param {Collection} collection - La collection.
 * @param {string} id - L'ID du document à supprimer.
 * @returns {Promise<Object>} - Le résultat de la suppression.
 */
async function deleteOneById(collection, id) {
    try {
        const objectId = new ObjectId(id);
        return await collection.deleteOne({_id: objectId});
    } catch (error) {
        console.error(`Erreur lors de la suppression: ${error.message}`);
        throw error;
    }
}


/**
 * Récupère tous les documents filtrés d'une collection.
 * @param {Collection} collection - La collection.
 * @param {Object} [query={}] - La requête pour filtrer les documents (par défaut, aucun filtre).
 * @returns {Promise<Array>} - La liste des documents trouvés.
 */
async function findAll(collection, query = {}) {
    try {
        return await collection.find(query).toArray();
    } catch (error) {
        console.error(`Erreur lors de la récupération des documents: ${error.message}`);
        throw error;
    }
}


// Export des services
module.exports = {
    findOneById,
    insertOne,
    updateOneById,
    deleteOneById,
    findAll,
};