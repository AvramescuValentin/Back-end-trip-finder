const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const Gender = require('../models/gender');
// const Location = require('../models/location');
// const Tags = require('../models/tags');
const locationService = require('../data_service/location-service');
const tagService = require('../data_service/tags-service');

const getUsers = async (req, res, next) => {
    let name = req.params.name;
    console.log(name);
    const regex = new RegExp(name, 'i');
    let users;
    try {
        const lastNameResults = await User.find({ lastName: { $regex: regex } }, 'firstName lastName image location');
        const firstNameResults = await User.find({ firstName: { $regex: regex } }, 'firstName lastName image location');
        console.log(firstNameResults);
        users = lastNameResults.concat(firstNameResults);
    } catch (err) {
        const error = new HttpError('Something went worg. Please come again later', 500);
        return next(error);
    }
    res.json({ users: users });
    console.log(users);
};

const getUserById = async (req, res, next) => {
    const userId = req.params.uid;
    console.log(userId);
    let users;
    try {
        users = await User.findById(userId, 'email username');
    } catch (err) {
        const error = new HttpError('Something went worg. Please come again later', 500);
        return next(error);
    }
    res.json({ users: users });

};


const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError('Invalid inputs passed, please check your data.', 422);
        return next(err);
    }

    const { firstName, lastName, username, email, phone, location, password, gender, dateOfBirth, tags, image } = req.body;
    let existingUser, userGender, userLocation;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Sign up failed. Please try again later.', 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('This Email is already in use. Please log in instead.', 422);
        return next(error);
    }
    ;

    try {
        userGender = await Gender.findOne({ value: gender });
    } catch (err) {
        const error = new HttpError("Could not find the gender.", 500);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        const userLocation = await locationService.searchCreateLocation(location, sess);
        const createdUser = new User({
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: password,
            gender: userGender,
            image: image,
            location: userLocation,
            phone: phone,
            dateOfBirth: dateOfBirth,
            tags: [],
            image: image
        });
        console.log(createdUser);
        if (tags) {
            await tagService.searchCreateTags(tags, createdUser, sess);
        }
        await createdUser.save({ session: sess });
        await sess.commitTransaction();


    } catch (err) {
        console.log(err);
        const error = new HttpError('Creating a new user failed. Please try again later', 500);
        return next(error);
    }

    res.status(201).json({ status: "User registered" });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Signing in failed. Please try again later', 500);
        return next(error);
    }
    if (!existingUser || existingUser.password !== password) {
        const error = HttpError('Invalid credentials.', 401);
        return next(error);
    }

    res.json({ message: 'Logged in!' });
};

exports.getUser = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;