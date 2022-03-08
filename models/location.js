const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const locationSchema = new Schema({
    country:{type: String, required: true},
    location:{type: String, required: true}
})

module.exports = mongoose.model('Location' , locationSchema);
