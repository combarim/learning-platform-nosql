// Question : Pourquoi créer un module séparé pour les connexions aux bases de données ?
// Réponse : 
// Question : Comment gérer proprement la fermeture des connexions ?
// Réponse : 

const { MongoClient} = require('mongodb');
const redis = require('redis');
const config = require('./env');



let db
let mongoClient = new MongoClient(config.mongodb.uri);
let redisClient = redis.createClient({
    url: config.redis.uri,
});



async function connectMongo() {
    let retries = 0; //nombre de tentatives actuelles
    const maxRetries = config.mongodb.maxRetries;
    const retryDelay = config.mongodb.retryDelay;

    while (retries < maxRetries) {
        try {
            await mongoClient.connect();
            db = mongoClient.db(config.mongodb.dbName);
            console.log("Connexion réussie à l'URI '" + config.mongodb.uri + "'");
            return;
        } catch (e) {
            retries++;
            console.error(`Erreur de connexion à l'URI '${config.mongodb.uri}'`);
            if (retries < maxRetries) {
                console.error(`Nouvelle tentative (${retries}/${maxRetries}) dans ${retryDelay / 1000} secondes...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));  // Attente avant la prochaine tentative
            } else {
                await closeMongo();
                throw new Error(`Échec de connexion à l'URI '${config.mongodb.uri}' : ${e.message}`);
            }
        }
    }
}

async function closeMongo() {
    if(!db)
        return;
    await mongoClient.close();
}

function getMongoClient() {
    return mongoClient;
}

function getDb() {
    return db;
}



async function connectRedis() {
    let retries = 0; //nombre de tentatives actuelles
    const maxRetries = config.redis.maxRetries;
    const retryDelay = config.redis.retryDelay;

    while (retries < maxRetries) {
        try {
            await redisClient.connect();
            console.log("Connexion réussie à l'URI '" + config.redis.uri + "'");
            return;
        }
        catch (err) {
            retries++;
            console.error(`Erreur lors de la connexion à Redis (tentative ${retries}/${maxRetries}): ${err.message}`);

            if (retries < maxRetries) {
                console.log(`Nouvelle tentative dans ${retryDelay}ms...`);
                await new Promise(res => setTimeout(res, retryDelay)); // Attente avant la prochaine tentative
            } else {
                console.error('Nombre maximum de tentatives atteint. Impossible de se connecter à Redis.');
                throw err;
            }
        }
    }
}

async function closeRedis() {
    if(!redisClient)
        return;
    await redisClient.quit()
        .catch((r)=> {
            console.log(`Échec de la fermeture de la connexion Redis: ${r.message}`);
        });
}

function getRedisClient() {
    return redisClient;
}


// Export des fonctions et clients
module.exports = {
    connectMongo,
    closeMongo,
    getMongoClient,
    getDb,
    connectRedis,
    closeRedis,
    getRedisClient
};