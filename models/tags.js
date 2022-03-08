const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tagsSchema = new Schema({
    value:{type:String, require:true}

})

module.exports = mongoose.model('Tags', tagsSchema);
