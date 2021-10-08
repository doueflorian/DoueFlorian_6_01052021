// Importation des différents éléments
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require('helmet');

dotenv.config();
const app = express();
app.use(cors());
app.use(helmet());


const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

// Connection à MongoDB via une variable d'environnement
mongoose.connect(process.env.MONGODB_CONNECT,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Configurer l'application
app.use((req, res, next) => {
    // Accepter les échanges de différentes origines
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Ajout des header nécessaires à l'API
    res.setHeader('Accesss-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    // Ajout des requêtes nécessaires à l'API
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());

// Indication du dosser statique utilisé par Multer
app.use('/images', express.static('images'));

// Spécification des routes pour Users et Sauces
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;