const Album = require('../models/Album')
const catchAsync = require('../helpers/catchAsync')
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

const albums = catchAsync(async (req, res) => {
    const albums = await Album.find();
    //console.log(albums);

    res.render('albums', {
        title: 'Mes albums',
        //albums
        albums: albums
    });
});
const album = catchAsync(async(req, res) => {
    try {
        const idAlbum = req.params.id;
        const album = await Album.findById(idAlbum);

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
});

const createAlbumForm = (req, res) => {
    res.render('new-album', {
        title: 'Nouvel album',
        errors: req.flash('error'),
    });
};


const createAlbum = catchAsync(async (req, res) => {
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
});


const addImage = catchAsync(async (req, res) => {
    const idAlbum = req.params.id;
    const album = await Album.findById(idAlbum);


    if (!req?.files?.image) {
        req.flash('error', 'Aucun fichier mis en ligne');
        res.redirect(`/albums/${idAlbum}`);
        return;
    }
    const image = req.files.image;
    if (image.mimetype != 'image/jpeg' && image.mimetype != 'image/png') {
        req.flash('error', 'Fichiers JPG & PNG accepté uniquement');
        res.redirect(`/albums/${idAlbum}`);
        return;
    }

    if (image.size > 10000000) {
        req.flash('error', 'Fichier trop gros');
        res.redirect(`/albums/${idAlbum}`);
        return;
    }

    const imageName = image.name;

    const folderPath = path.join(__dirname, '../public/uploads', idAlbum);
    fs.mkdirSync(folderPath, { recursive: true });
 
    const localPath = path.join(folderPath, imageName);
    console.log(folderPath);
    console.log(localPath);
    
    await req.files.image.mv(localPath);

    album.images.push(imageName);
    await album.save();

    res.redirect(`/albums/${idAlbum}`);
});

const deleteImage = catchAsync(async (req, res) => {
    const idAlbum = req.params.id;
    const album = await Album.findById(idAlbum);

    const imageIndex = req.params.imageIndex;
    const image = album.images[imageIndex];
    if (!image) {
        res.redirect(`/albums/${idAlbum}`);
        return;
    }
    album.images.splice(imageIndex, 1);
    await album.save();

    const imagePath = path.join(__dirname, '../public/uploads', idAlbum, image);
    fs.unlinkSync(imagePath);

    res.redirect(`/albums/${idAlbum}`);
});

const deleteAlbum = catchAsync(async (req, res) => {
    const idAlbum = req.params.id;
    await Album.findByIdAndDelete(idAlbum);

    const albumPath = path.join(__dirname, '../public/uploads', idAlbum);
    rimraf(albumPath, (err) => {
        res.redirect('/albums');

    });
});

module.exports = {
    albums,
    createAlbumForm,
    createAlbum,
    album,
    addImage,
    deleteImage,
    deleteAlbum,

}