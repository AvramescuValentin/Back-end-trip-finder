const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title:{type:String, required:true},
    description:{type:String},
    groupId:{type:mongoose.Types.ObjectId, required:true, ref:'Group'},
    creator:{type:mongoose.Types.ObjectId, required:true, ref:'User'}
});

module.exports = mongoose.model('Note', noteSchema);