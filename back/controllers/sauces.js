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
            if (req.file) {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`./images/${filename}`, () => {});
            }
            Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
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
  
            fs.unlink(`./images/${filename}`, () => {
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
    .catch(error => res.status(403).json({error}));
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
     .then(sauce => res.status(200).json(sauce))
     .catch(error => res.status(400).json({error}));
};

exports.likeSauce = (req, res, next) => {
    const newLike = req.body.like;
    const user = req.body.userId;
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        const sauceUsersLiked = sauce.usersLiked;
        const sauceUsersDisliked = sauce.usersDisliked;
        const foundUserLiked = sauceUsersLiked.findIndex(u => u == user);
        const foundUserDisliked = sauceUsersDisliked.findIndex(u =>u == user);
        switch (newLike) {
            case -1 :
                if (foundUserDisliked !== -1) {
                    sauce.usersDisliked.splice(foundUserDisliked,1);
                    Sauce.updateOne({_id: req.params.id}, {dislikes: sauce.disllikes -=1, usersDsiliked: sauce.usersDisliked})
                    .then(() => { res.status(200).json({message: 'Objet Modifié'})})
                    .catch(error => res.status(401).json({error}));
                }
                else if(foundUserLiked === 1){
                    sauce.usersLiked.splice(foundUserLiked,1);
                    sauce.usersDisliked.push(user);
                    Sauce.updateOne({_id: req.params.id}, {likes: sauce.likes -=1, dislikes: sauce.dislikes +=1, usersLiked: sauce.usersLiked, usersDisliked: sauce.usersDisliked})
                    .then(() => { res.status(200).json({message: 'Objet Modifié'})})
                    .catch(error => res.status(401).json({error}));
                }
                else if ((foundUserLiked === -1) || (foundUserDisliked === -1)) {
                    sauce.usersDisliked.push(user);
                    Sauce.updateOne({_id: req.params.id}, {dislikes: sauce.dislikes +=1, usersDisliked: sauce.usersDisliked})
                    .then(() => { res.status(200).json({message: 'Objet Modifié'})})
                    .catch(error => res.status(401).json({error}));
                }
                break;
            case 0 :
                if(foundUserLiked !== -1){
                    sauce.usersLiked.splice(foundUserLiked,1);
                    Sauce.updateOne({_id: req.params.id}, {likes: sauce.likes -=1, usersLiked: sauce.usersLiked})
                    .then(() => { res.status(200).json({message: 'Objet Modifié'})})
                    .catch(error => res.status(401).json({error}));
                }
                else if(foundUserDisliked !== -1){
                    sauce.usersDisliked.splice(foundUserDisliked,1);
                    Sauce.updateOne({_id: req.params.id}, {dislikes: sauce.dislikes -=1, usersDisliked: sauce.usersDisliked})
                    .then(() => { res.status(200).json({message: 'Objet Modifié'})})
                    .catch(error => res.status(401).json({error}));                                                                
                    console.log(sauce);                
                }
                break;
            case 1 :
                if (foundUserLiked !== -1) {
                    sauce.usersLiked.splice(foundUserLiked,1);
                    Sauce.updateOne({_id: req.params.id}, {likes: sauce.likes -=1, usersLiked: sauce.usersLiked})
                    .then(() => { res.status(200).json({message: 'Objet Modifié'})})
                    .catch(error => res.status(401).json({error}));
                }
                else if(foundUserDisliked === 1){
                    sauce.usersDisliked.splice(foundUserDisliked,1);
                    sauce.usersLiked.push(user);
                    Sauce.updateOne({_id: req.params.id}, {likes: sauce.likes +=1, dislikes: sauce.dislikes -=1, usersLiked: sauce.usersLiked, usersDisliked: sauce.usersDisliked})
                    .then(() => { res.status(200).json({message: 'Objet Modifié'})})
                    .catch(error => res.status(401).json({error}));
                }
                else if ((foundUserLiked === -1) || (foundUserDisliked == -1)) {
                    sauce.usersLiked.push(user);
                    Sauce.updateOne({_id: req.params.id}, {likes: sauce.likes +=1, usersLiked: sauce.usersLiked})
                    .then(() => { res.status(200).json({message: 'Objet Modifié'})})
                    .catch(error => res.status(401).json({error}));
                }
                break;
        }
    })    
    .catch(error => res.status(401).json({error}));
};