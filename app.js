require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');
const groupRoutes = require('./routes/group-routes');
const userRoutes = require('./routes/user-routes')

const port = 5000;
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, x-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
});

app.use('/api/group', groupRoutes);

app.use('/api/user', userRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
});

app.use((error, req, res, next) => {
    console.log("eror" + error);
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || "An unknown error occured" });
});


mongoose
    .connect(process.env.DB_LINK, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => { // daca am reusit sa ne connectam la baza de date pornim si serverul
        app.listen(process.env.PORT || port, () => {
            console.log("Server is listening on port 5000!");
        });
    })
    .catch(err => {
        console.log(err); //altfel vom returna o eroare
    });

