const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const genderSchema = new Schema({
    value: {type: String, require: true}
})

module.exports = mongoose.model('Gender', genderSchema);