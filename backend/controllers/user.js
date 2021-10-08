const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// Inscription de l'utilisateur
exports.signup = (req,  res, next) => {
    // Vérifier si eMail déjà présent, si oui, l'indiquer
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                return res.status(401).json({ message: 'Utilisateur déjà enregistré' })
            }
    // Utilisation de bcrypt afin d'hasher le mot de passe
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // Sauvegarder l'utilisateur avec le mot de passe crypté
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé'}))
                .catch(error => res.status(400).json({ error }));
        })
    })
        .catch(error => res.status(500).json({ error }));
};

// Authentification de l'utilisateur
exports.login = (req, res, next) => {
    // Vérifier si eMail déjà présent, si non, l'indiquer
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Utilisateur non trouvé' })
            }
            // utiliser Bcrypt pour comparer le mot de passe rentré à celui enregistré crypté
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Mot de passe incorrect' })
                    }
                // Créer un token d'authentification avec JSONWebToken
                // L'ID de l'utilisateur sera encodé dans le token
                res.status(200).json({ 
                    userId: user._id,
                    token: jwt.sign(
                        {userId: user._id},
                        'akoikfgtyhnn',
                        { expiresIn: '24h'}
                    )
                });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};