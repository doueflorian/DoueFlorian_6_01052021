const Sauce = require('../models/Sauce');
const fs = require('fs');
const { db } = require('../models/Sauce');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Object enregistré !'}))
        .catch(error => res.status(400).json({ error }));

};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié' }))
        .catch(error => res.status(404).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                .then(sauce => res.status(200).json({ message: 'Objet supprimé' }))
                .catch(error => res.status(404).json({ error }));                
            })
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.getEverySauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

exports.likeTheSauce = (req, res, next) => {

// const userLiked = Sauce.exists({usersLiked: req.body.userId});
// if (userLiked) {console.log("user did like")};

// const userDisliked = Sauce.exists({usersDisliked: req.body.userId});

let usersLikeArray = [];
let usersDislikeArray = [];

let userLiked = false;
let userDisliked = false;

let userLikeId = req.body.userId;

function didItLikeit() {
    if(usersLikeArray.includes(userLikeId)) {
        userLiked = true;
    } else if(usersDislikeArray.includes(userLikeId)){
        userDisliked = true;
    } else {
        console.log("n'a pas donné son avis")
    }
}


    function manageLikeSystem() {

        if(req.body.like == 1){
            Sauce.updateOne({_id: req.params.id}, {
                            $addToSet:{usersLiked:req.body.userId},
                            $pull: {usersDisliked:req.body.userId},
                            $inc:{likes: 1}
                            })
                .then(() => res.status(200).json({ message: 'Sauce likée' }))
                .catch(error => res.status(404).json({ error })); 
        }else if(req.body.like == -1){
            Sauce.updateOne({_id: req.params.id}, {
                            $addToSet:{usersDisliked:req.body.userId},
                            $pull: {usersLiked:req.body.userId},
                            $inc:{dislikes: 1}
                            })
                .then(() => res.status(200).json({ message: 'Sauce dislikée' }))
                .catch(error => res.status(404).json({ error })); 
        }else if(req.body.like == 0 && userLiked){
            Sauce.updateOne({_id: req.params.id}, {
                            $pull: {usersLiked:req.body.userId},
                            $inc:{likes: -1}
                            })
                .then(() => res.status(200).json({ message: "Pas d'avis sur la sauce" }))
                .catch(error => res.status(404).json({ error })); 
        }else if(req.body.like == 0 && userDisliked){
            Sauce.updateOne({_id: req.params.id}, {
                            $pull: {usersDisliked:req.body.userId},
                            $inc:{dislikes: -1}
                            })
                .then(() => res.status(200).json({ message: "Pas d'avis sur la sauce" }))
                .catch(error => res.status(404).json({ error })); 

        }

    }

    

    Sauce.findOne({_id: req.params.id})
    .then(function(dataSauce) {
        usersLikeArray = dataSauce.usersLiked;
        usersDislikeArray = dataSauce.usersDisliked;    

        didItLikeit();
        manageLikeSystem();
});
};