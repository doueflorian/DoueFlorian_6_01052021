const Sauce = require('../models/Sauce');
const fs = require('fs');

// Créer une sauce
exports.createSauce = (req, res, next) => {
    // Parser la requête afin de pouvoir gérer l'ajout du fichier
    const sauceObject = JSON.parse(req.body.sauce);
    // Supprimer l'ID de la sauce afin de rajouter celle de Mongoose
    delete sauceObject._id;
    const sauce = new Sauce({
        // Récupérer les informations de la requête,
        ...sauceObject,
        // Ajouter l'URL de l'image
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        // Initialiser les likes et dislikes à 0
        likes: 0,
        dislikes: 0,
        //  Initialiser les tableaux d'usersID pour les likes et dislikes
        usersLiked: [],
        usersDisliked: []
    });
    // Supprimer la sauce
    sauce.save()
        .then(() => res.status(201).json({ message: 'Object enregistré !'}))
        .catch(error => res.status(400).json({ error }));
};

// Modifier une sauce
exports.modifySauce = (req, res, next) => {    // Vérifier si la requête envoie un fichier
    const sauceObject = req.file ?
    {  // Si un fichier est présent, modifier l'URL de l'image en conséquence
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { // Sinon, ne pas se préoccuper de l'image
         ...req.body 
        };
    // Mettre la jour à sauce depuis le résultat sauceObject
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié' }))
        .catch(error => res.status(404).json({ error }));
};

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            // Récupérer le nom de l'image de la sauce après /images/ et la supprimer du serveur
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                // Supprimer la sauce
                Sauce.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Objet supprimé' }))
                .catch(error => res.status(404).json({ error }));                
            })
        })
        .catch(error => res.status(500).json({ error }));
};

// Trouver toutes les sauces
exports.getEverySauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

// Trouver une sauce par son ID
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// Fonction de like pour la sauce
exports.likeTheSauce = (req, res, next) => {

    // Initialiser les tableaux d'userID pour les remplir ensuite
    let usersLikeArray = [];
    let usersDislikeArray = [];

    // Déclarer userLiked et userDisliked comme faux
    let userLiked = false;
    let userDisliked = false;

    let userLikeId = req.body.userId;

    // Fonction qui retourne si l'utilisateur a liké ou disliké une sauce
    // en vérifiant la présence de son ID dans les tableaux de la sauce visée
    function didItLikeit() {
        if(usersLikeArray.includes(userLikeId)) {
            userLiked = true;
        } else if(usersDislikeArray.includes(userLikeId)){
            userDisliked = true;
        } else {
            console.log("n'a pas donné son avis")
        }
    }

    // Fonction qui contrôle les likes et gère les ajouts d'userID dans les tableaux
    function manageLikeSystem() {

        // Si L'utilisateur like une sauce, ajouter son ID au tableau "usersLikeArray", et le supprimer de "UsersDislikeArray"
        // afin d'éviter sa présence dans les deux.
        if(req.body.like == 1){
            Sauce.updateOne({_id: req.params.id}, {
                            $addToSet:{usersLiked:req.body.userId},
                            $pull: {usersDisliked:req.body.userId},
                            $inc:{likes: 1}
                            })
                .then(() => res.status(200).json({ message: 'Sauce likée' }))
                .catch(error => res.status(404).json({ error })); 
        // Si L'utilisateur dislike une sauce, ajouter son ID au tableau "usersDislikeArray", et le supprimer de "UsersLikeArray"
        // afin d'éviter sa présence dans les deux.
        }else if(req.body.like == -1){
            Sauce.updateOne({_id: req.params.id}, {
                            $addToSet:{usersDisliked:req.body.userId},
                            $pull: {usersLiked:req.body.userId},
                            $inc:{dislikes: 1}
                            })
                .then(() => res.status(200).json({ message: 'Sauce dislikée' }))
                .catch(error => res.status(404).json({ error })); 
        // Si L'utilisateur retire son like ou dislike ET qu'il est présent dans le tableau "usersLikeArray"
        // retirer - 1 aux likes de la sauce
        }else if(req.body.like == 0 && userLiked){
            Sauce.updateOne({_id: req.params.id}, {
                            $pull: {usersLiked:req.body.userId},
                            $inc:{likes: -1}
                            })
                .then(() => res.status(200).json({ message: "Pas d'avis sur la sauce" }))
                .catch(error => res.status(404).json({ error })); 
        // Si L'utilisateur retire son like ou dislike ET qu'il est présent dans le tableau "usersDislikeArray"
        // retirer - 1 aux dislikes de la sauce
        }else if(req.body.like == 0 && userDisliked){
            Sauce.updateOne({_id: req.params.id}, {
                            $pull: {usersDisliked:req.body.userId},
                            $inc:{dislikes: -1}
                            })
                .then(() => res.status(200).json({ message: "Pas d'avis sur la sauce" }))
                .catch(error => res.status(404).json({ error })); 
        }
    }
    
    // Trouver la sauce visée via son ID et lancer les fonctions
    Sauce.findOne({_id: req.params.id})
    .then(function(dataSauce) {
        // Récupérer les tableaux avec les usersID
        usersLikeArray = dataSauce.usersLiked;
        usersDislikeArray = dataSauce.usersDisliked;    

        didItLikeit();
        manageLikeSystem();
    });
};