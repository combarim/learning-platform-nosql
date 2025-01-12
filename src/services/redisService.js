// Question : Comment gérer efficacement le cache avec Redis ?
// Réponse : Utiliser des durées de vie (TTL) appropriées pour éviter une surutilisation de la mémoire, invalider les clés obsolètes, et mettre en place des stratégies de rafraîchissement ou de récupération.
// Question: Quelles sont les bonnes pratiques pour les clés Redis ?
// Réponse : Utiliser des noms de clés descriptifs et hiérarchiques, éviter les clés trop longues, et éviter de stocker trop de données dans une seule clé.


const {getRedisClient} = require('./../config/db');


/**
 * Mettre en cache des données avec une clé et une durée de vie (TTL).
 * @param {string} key - La clé du cache.
 * @param {any} data - Les données à mettre en cache.
 * @param {number} ttl - Le temps de vie en secondes.
 * @returns {Promise<void>} - Une promesse résolue une fois les données mises en cache.
 */
async function cacheData(key, data, ttl) {
  try {
    const serializedData = JSON.stringify(data);
    await getRedisClient().set(key, serializedData, 'EX', ttl);
  } catch (error) {
    console.error(`Erreur lors de la mise en cache : ${error.message}`);
    throw error;
  }
}


/**
 * Récupérer des données en cache par leur clé.
 * @param {string} key - La clé du cache.
 * @returns {Promise<any>} - Les données désérialisées ou null si la clé n'existe pas.
 */
async function getCachedData(key) {
  try {
    const data = await getRedisClient().get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Erreur lors de la récupération des données en cache : ${error.message}`);
    throw error;
  }
}


/**
 * Supprimer une donnée du cache avec sa clé.
 * @param {string} key - La clé, à supprimer.
 * @returns {Promise<void>} - Une promesse résolue une fois la clé supprimée.
 */
async function deleteCache(key) {
  try {
    await getRedisClient().del(key);
  } catch (error) {
    console.error(`Erreur lors de la suppression du cache : ${error.message}`);
    throw error;
  }
}


module.exports = {
  cacheData,
  getCachedData,
  deleteCache,
};
