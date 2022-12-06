const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const flash = require('connect-flash')
const mongoose = require('mongoose');
const path = require('path');
const albumRoutes = require('./routes/album.routes')

const app = express();

mongoose.connect('mongodb://localhost/phototheque');

app.use(express.urlencoded({extended:false}))
app.use(express.json());
app.use(fileUpload());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'Pd4UIdgMa',
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: true }
}));
app.use(flash());
app.get('/', (req, res) => {
    res.redirect('/albums');
});



//ajout d'un préfixe après la / si nécessaire!
app.use('/',albumRoutes)

app.use((use, res) => {
    res.status(404);
    res.send('page non trouvée');
});


app.listen(3001, () => {
    console.log('application lancée sur le port 3001');
});