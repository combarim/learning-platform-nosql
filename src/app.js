// Question: Comment organiser le point d'entrée de l'application ?
// Question: Quelle est la meilleure façon de gérer le démarrage de l'application ?

const express = require('express');
const config = require('./config/env');
const db = require('./config/db');

const courseRoutes = require('./routes/courseRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();


async function startServer() {
  try {

    await db.connectMongo()
    await db.connectRedis()

    app.use(express.json())
    app.use('/api/courses', courseRoutes);
    app.use('/api/students', studentRoutes);

    app.listen(config.port, () => {
      console.log(`Serveur lancé sur http://localhost:${config.port}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}


// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
  await db.closeMongo()
  await db.closeRedis()
  process.exit(0);
  console.log("Arrêt du serveur")
});


startServer();