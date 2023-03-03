const Sauce = require('../models/Sauce');
const fs = require('fs');
const { use } = require('../routes/sauces');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    sauce.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
 };

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
        if (sauce.userId != req.auth.userId) {
            res.status(401).json({message: 'Non-autorisé'});
        } else {
            sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
            .then(() => res.status(200).json({message: 'Objet modifié'}))
            .catch(error => res.status(401).json({error}));
        }
    })
    .catch(error => { res.status(400).json( { error })})
};

exports.deleteSauce = (req, res, next) => {
   Sauce.findOne({_id: req.params.id})
   .then(sauce => {
        if (sauce.userId != req.auth.userId) {
            res.status(401).json({message: 'Non-autorisé'});
        } else {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/'${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                .then(() => { res.status(200).json({message: 'Objet Supprimé'})})
                .catch(error => res.status(401).json({error}));
            });
        }
   })
   .catch( error => res.status(500).json({error}) );
};

exports.getOneSauce = (req, res, next) => {       
    Sauce.findOne({_id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error}));
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
     .then(sauce => res.status(200).json(sauce))
     .catch(error => res.status(400).json({error}));
 };

 exports.likeSauce = (req, res, next) => {
    const like = req.body.like;
    const user = req.body.userId;

    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        const sauceUsersLiked = Sauce.usersLiked;
        const sauceUsersDisliked = Sauce.usersDisliked;
        const foundUserLiked = sauceUsersLiked.findIndex(u == user);
        const foundUserDisliked = sauceUsersDisliked.findIndex(u == user);
        if(like == -1) {
            if (sauceUsersDisliked[foundUserDisliked] == user) {
                res.status(401).json({message: 'Non-autorisé'});
            }
            else if(foundUserLiked){
                Sauce.like -=1;
                Sauce.usersLiked.splice(foundUserLiked,1);
                Sauce.usersDisliked.push(user);
            }
            else {
                Sauce.usersDisliked.push(user);
            }
        }

        if(like == 0) {
            if ((sauceUsersDisliked[foundUserDisliked] != user) || (sauceUsersLiked[foundUserLiked] != user)) {
                res.status(401).json({message: 'Non-autorisé'});
            }
            if(foundUserLiked){
                Sauce.like -=1;
                Sauce.usersLiked.splice(foundUserLiked,1);
            }
            if(foundUserDisliked){
                Sauce.like +=1;
                Sauce.usersLiked.splice(foundUserLiked,1);
            }
        }
        if(like == 1) {
            console.log('coucou');
            if (sauceUsersLiked[foundUserLiked] == user) {
                res.status(401).json({message: 'Non-autorisé'});
            }
            else if(foundUserDisliked){
                Sauce.like +=1;
                Sauce.usersDisliked.splice(foundUserLiked,1);
                Sauce.usersLiked.push(user);
            }
            else {
                Sauce.usersLiked.push(user);
            }
        }
    })
    sauce.updateOne({_id: req.params.id}, {...sauceObject, like: Sauce.like, usersLiked: Sauce.usersLiked, usersDisliked: Sauce.sauceUsersDisliked})
        .then(() => { res.status(200).json({message: 'Objet Supprimé'})})
        .catch(error => res.status(401).json({error}));
};