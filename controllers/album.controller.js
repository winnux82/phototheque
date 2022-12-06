const Album = require('../models/Album')
const path = require('path');
const fs = require('fs');

const albums = async(req, res) => {
    const albums = await Album.find();
    //console.log(albums);

    res.render('albums', {
        title: 'Mes albums',
        //albums
        albums: albums
    });
}
const album = async(req, res) => {
    try {
        console.log(req.params.id);
        const idAlbum = req.params.id;
        const album = await Album.findById(idAlbum);

        console.log(album);
        res.render('album', {
            title: `Mon Album ${album.title}`,
            album,
            errors: req.flash('error'),
        });
    } catch (err) {
        console.log(err);
        res.redirect('/404');
        res.send(err + 'Page non trouvée');
    }
};

const createAlbumForm = (req, res) => {
    res.render('new-album', {
        title: 'Nouvel album',
        errors: req.flash('error'),
    });
};


const createAlbum = async (req, res) => {
    try {
        if (!req.body.albumTitle) {
            req.flash('error', 'Le titre ne doit pas être vide!');
            res.redirect('/album/create');
            return;

        }
        await Album.create({
            title: req.body.albumTitle,
        });
        res.redirect('/albums');
    } catch (err) {
        //console.log(err);
        req.flash('error', 'Erreur lors de la création de l\'album');
        res.redirect('/album/create');
   }
};


const addImage = async (req, res) => {
    const idAlbum = req.params.id;
    const album = await Album.findById(idAlbum);

    console.log(req.files);
    const imageName = req.files.image.name;

    const folderPath = path.join(__dirname, '../public/uploads', idAlbum);
    fs.mkdirSync(folderPath,{recursive:true});
 

    const localPath = path.join(folderPath, imageName);
    console.log(folderPath);
    console.log(localPath);
    
    await req.files.image.mv(localPath);

    album.images.push(imageName);
    await album.save();

    res.redirect(`/albums/${idAlbum}`);
}


module.exports = {
    albums,
    createAlbumForm,
    createAlbum,
    album,
    addImage,
}