const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    gender: { type: mongoose.Types.ObjectId, ref: 'Gender', required: true },
    image: { type: String, default: 'https://avpn.asia/wp-content/uploads/2015/05/empty_profile.png' },
    groups: [{ type: mongoose.Types.ObjectId, ref: 'Group' }],
    location: { type: mongoose.Types.ObjectId, ref: 'Location', required: true },
    dateOfBirth: { type: Date, required: true },
    tags: [{ type: mongoose.Types.ObjectId, ref: 'Tags' }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);