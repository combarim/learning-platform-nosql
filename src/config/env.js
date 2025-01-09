// Question: Pourquoi est-il important de valider les variables d'environnement au démarrage ?
// Réponse : parce que si une variable d'environnement est manquante ou invalide, l'application ne fonctionnera pas correctement
// Question: Que se passe-t-il si une variable requise est manquante ?
// Réponse : si une variable requise est manquante, une erreur sera levée

const dotenv = require('dotenv');
dotenv.config();

const requiredEnvVars = [
  'MONGODB_URI',
  'MONGODB_DB_NAME',
  'REDIS_URI'
];


// Validation des variables d'environnement
function validateEnv() {

  //vérifier que toutes les variables d'environnement sont définies
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Il manque la variable d'environnement: ${envVar}`);
    }
  }

  const mongodbUriRegex = /^(mongodb(?:\+srv)?:\/\/)([a-zA-Z0-9\-_.]+)(?::([0-9]+))?(?:\/([a-zA-Z0-9\-_.]+))?(?:\?(.+))?$/;
  const redisUriRegex = /^redis:\/\/(?:[a-zA-Z0-9._%+-]+:[^@]+@)?[a-zA-Z0-9.-]+(?::\d+)?(?:\/\d+)?$/ 
  const mongodbDbNameRegex = /^(?![0-9]\.)(?!.*[\\"/$\00]).{1,64}$/
  const mongodbDbName = process.env.MONGODB_DB_NAME

  //vérifie si mongodbUri est de la forme : mongodb[+srv]://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]
  if(mongodbUriRegex.test(process.env.MONGODB_URI) === false) {
    throw new Error('MONGODB_URI n\'est pas valide');
  }

  //vérifie si redisUri est de la forme : redis://[username:password@]host[:port][/db-number]
  if(redisUriRegex.test(process.env.REDIS_URI) === false) {
    throw new Error('REDIS_URI n\'est pas valide');
  }

  //si la variable est vide
  if(mongodbDbName.length === 0) {
    throw new Error('MONGODB_DB_NAME ne doit pas être vide');
  }

  //si la variable contient des caractères interdits
  if(mongodbDbNameRegex.test(mongodbDbName) === false) {
    throw new Error('MONGODB_DB_NAME n\'est pas valide');
  }
}


module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME,
    maxRetries: process.env.MONGODB_DB_MAX_RETRIES || 5,
    retryDelay: process.env.MONGODB_DB_RETRY_DELAY || 2000,
  },
  redis: {
    uri: process.env.REDIS_URI,
    maxRetries: process.env.REDIS_MAX_RETRIES || 5,
    retryDelay: process.env.REDIS_RETRY_DELAY || 2000,
  },
  port: process.env.PORT || 3000
};