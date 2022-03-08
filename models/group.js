const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const groupSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, default:"https://static.rentcars.com/imagens/modules/localidade/about/983-desktop-location-description.png"},
    location: {type: mongoose.Types.ObjectId, ref: 'Location', required: true},
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tags'}],
    tripDate: {type:Date, required:true},
    creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    members:[{type: mongoose.Types.ObjectId, ref: 'User'}]

})

module.exports = mongoose.model('Group', groupSchema);
