# API pour une plateforme d'apprentissage en ligne

---

Ce projet est une API backend conçue pour servir de base à une plateforme d'apprentissage en ligne. Il utilise Node.js, Express pour le framework web, MongoDB comme base de données principale et Redis pour la mise en cache.

## Table des matières

---
- [Objectifs du projet](#Objectifs-du-projet)
- [Technologies utilisées](#technologies-utilisées)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Exemples de requêtes](#exemples-de-requêtes)
- [Choix Architecturaux et Réflexions](#Choix-Architecturaux-et-Réflexions)
- [Licence](#licence)

## Objectifs du projet

---

Le but de ce projet est de développer une API backend professionnelle en utilisant **Node.js**, **Express**, et des bases de données NoSQL comme **MongoDB** et **Redis**. Cette API gère :
- Les cours : création, mise à jour, suppression, récupération, statistiques.
- Les étudiants : gestion des inscriptions, récupération des informations, statistiques.


## Technologies utilisées

---

- **Node.js** : Pour la logique de serveur.
- **Express** : Framework pour la gestion des requêtes HTTP.
- **MongoDB** : Stockage principal des données.
- **Redis** : Gestion du cache pour améliorer les performances.
- **dotenv** : Gestion des variables d'environnement.


## Structure du projet

---

📁 src  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 config  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── env.js  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── db.js  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 controllers  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── courseController.js  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── studentController.js  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 routes  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── courseRoutes.js  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── studentRoutes.js  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 services  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── mongoService.js  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── redisService.js  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 app.js  
📄 package.json



---

## Installation

---

### Prérequis

- **Node.js** version 16 ou supérieure
- **MongoDB** (local ou cloud)
- **Redis** (local ou cloud)

### Étapes d'installation

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/username/projet-api-nosql.git
   cd projet-api-nosql
   ```
   
2. Installez les dépendances :
   ```bash
   npm install
   ```
   
3. Configurez les variables d'environnement  
<br>Créez un fichier .env et ajoutez les variables d'environnements suivantes :
   - MONGODB_URI
   - MONGODB_DB_NAME
   - REDIS_URI
   - PORT  
   
   <br>Exemple de fichier .env avec les variables requises
   ```bash
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=nom_de_la_base
   REDIS_URI=redis://localhost:6379
   PORT=3000
   ```
   
4. Lancez l'application 
   ```bash
   npm start
   ```

   L'API sera disponible sur http://localhost:3000.

## Utilisation

---

### Endpoints principaux

- Cours :
   - POST /api/courses : Créer un cours.
   - GET /api/courses : Récupérer tous les cours.
   - GET /api/courses/:id : Récupérer un cours par ID.
   - PUT /api/courses/:id : Mettre à jour un cours.
   - DELETE /api/courses/:id : Supprimer un cours.

- Étudiants :
   - POST /api/students : Ajouter un étudiant.
   - GET /api/students : Lister tous les étudiants.
   - GET /api/students/:id : Récupérer un étudiant par ID.
   - POST /api/students/:id/courses : Inscrire un étudiant à un cours.

## Exemples de requêtes

---

### Créer un cours
```bash
curl -X POST http://localhost:3000/api/courses \
-H "Content-Type: application/json" \
-d '{
"title": "Introduction à MongoDB",
"description": "Un cours pour débuter avec MongoDB",
"duration": "4h"
}'
```

### Lister tous les cours
```bash
curl -X GET http://localhost:3000/api/courses
```

## Choix Architecturaux et Réflexions

---

Cette section détaille les choix architecturaux effectués et apporte des réponses aux questions soulevées dans les commentaires des fichiers du projet.

### Fichier `app.js`
**Question : Comment organiser le point d'entrée de l'application ?**  
Réponse : Le point d'entrée de l'application est structuré pour initialiser les composants essentiels, comme les middlewares, les routes et les connexions aux bases de données. Cela garantit une configuration claire et centralisée.

**Question : Quelle est la meilleure façon de gérer le démarrage de l'application ?**  
Réponse : Utiliser une fonction asynchrone (`startServer`), ce qui permet de gérer toutes les initialisations avant le lancement du serveur. Cela évite les erreurs liées à des dépendances non initialisées.


### Fichier `config/env.js`
**Question : Pourquoi est-il important de valider les variables d'environnement au démarrage ?**  
Réponse : Une variable manquante ou incorrecte peut entraîner des pannes ou un comportement imprévisible. La validation garantit que l'application dispose de toutes les informations nécessaires dès son démarrage.

**Question : Que se passe-t-il si une variable requise est manquante ?**  
Réponse : Une erreur est levée avec un message descriptif. Cela empêche l'application de fonctionner dans un état incohérent.


### Fichier `config/db.js`
**Question : Pourquoi créer un module séparé pour les connexions aux bases de données ?**  
Réponse : Un module dédié centralise la logique de connexion, ce qui améliore la maintenabilité. Il permet aussi de réutiliser les connexions dans différentes parties de l'application sans duplication de code.

**Question : Comment gérer proprement la fermeture des connexions ?**  
Réponse : La gestion propre passe par des fonctions spécifiques pour fermer chaque connexion (`closeMongo`, `closeRedis`), appelées lors d'événements système comme `SIGTERM`.

### Fichier `controllers/courseController.js`
**Question : Quelle est la différence entre un contrôleur et une route ?**  
Réponse : Un contrôleur contient la logique métier (traitement des données, appels aux services). Une route, quant à elle, est responsable de diriger les requêtes vers le contrôleur approprié.

**Question : Pourquoi séparer la logique métier des routes ?**  
Réponse : Cette séparation améliore la lisibilité, facilite les tests unitaires et permet la réutilisation de la logique métier dans différents contextes.

### Fichier `routes/courseRoutes.js` et `routes/studentRoutes.js`
**Question : Pourquoi séparer les routes dans différents fichiers ?**  
Réponse : Cela permet d'organiser les routes par ressource (exemple : cours, étudiants), rendant le code plus lisible et plus facile à maintenir.

**Question : Comment organiser les routes de manière cohérente ?**  
Réponse : En suivant une structure CRUD standard (Create, Read, Update, Delete) et en utilisant des noms de routes descriptifs.

### Fichier `services/mongoService.js`
**Question : Pourquoi créer des services séparés ?**  
Réponse : Les services isolent la logique d'accès aux données, ce qui permet une meilleure organisation et une réutilisation facile dans différents contrôleurs. Cela facilite également les tests.

### Fichier `services/redisService.js`
**Question : Comment gérer efficacement le cache avec Redis ?**  
Réponse : Utiliser un TTL (Time-to-Live) approprié, invalider les clés obsolètes et implémenter une stratégie de rafraîchissement des données.

**Question : Quelles sont les bonnes pratiques pour les clés Redis ?**  
Réponse : Utiliser des noms de clés hiérarchiques et descriptifs pour identifier facilement leur contenu. Évitez les clés trop longues ou contenant trop de données.


## Licence

---

Ce projet est sous licence MIT.