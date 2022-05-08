const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const groupSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    generatedId: { type: String, required: true },
    isPrivate: { type: String, required: true },
    password: { type: String },
    imageUrl: { type: String },
    location: { type: mongoose.Types.ObjectId, ref: 'Location', required: true },
    tags: [{ type: mongoose.Types.ObjectId, ref: 'Tags' }],
    tripDateStart: { type: Date, required: true },
    tripDateEnd: { type: Date, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    members: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false }

})

module.exports = mongoose.model('Group', groupSchema);
