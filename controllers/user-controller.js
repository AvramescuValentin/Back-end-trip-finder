const { validationResult } = require('express-validator');
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const Gender = require('../models/gender');
// const Location = require('../models/location');
// const Tags = require('../models/tags');
const locationService = require('../services/data/location-service');
const tagService = require('../services/data/tags-service');
const userService = require('./../services/data/user-service');
const cloudinaryTools = require("./../services/files/cloudinaryTools");


const getProfile = async (req, res, next) => {
    const userId = req.userData.userId;
    let user;
    try {
        user = await User.findById(userId).populate('gender').populate('groups').populate('tags').populate('location');
    } catch (err) {
        const error = new HttpError("Could not retrieve the user. Please try again", 500);
        return next(error);
    }
    if (!user) {
        const error = new HttpError("This user does not exist. Please check the id", 404);
        return next(error);
    }
    const parsedUser = userService.translateUser(user);
    res.json({ user: parsedUser });
}

const patchProfile = async (req, res, next) => {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    const userId = req.userData.userId;
    let user, userGender;
    try {
        user = await User.findById(userId);
    } catch (err) {
        const error = new HttpError("Could not retrieve user. Please try again later", 500);
        return next(error);
    }
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.phone = req.body.phone;
    user.email = req.body.email;
    if (req.body.gender) {
        try {
            user.gender = await Gender.findOne({ value: req.body.gender });
        } catch (err) {
            const error = new HttpError("Could not find the gender.", 500);
            return next(error);
        }
    }

    if (req.body.location) {
        try {
            const location = req.body.location;
            user.location = await locationService.searchCreateLocation(location, sess);
        } catch (err) {
            const error = new HttpError("Could not find and create the location.", 500);
            return next(error);
        }
    }

    if (req.body.image) {
        try {
            user.image = await cloudinaryTools.uploadImage(req.body.image);
        } catch (err) {
            const error = new HttpError("Could not upload the profile picture", 500);
            return next(error);
        }
    }
    try {
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Updating the user failed. Please try again later', 500);
        return next(error);
    }

    res.status(200).json({ user: user });

};


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
    let hashedPassword, createdUser;
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
    };

    try {
        userGender = await Gender.findOne({ value: gender });
    } catch (err) {
        const error = new HttpError("Could not find the gender.", 500);
        return next(error);
    }

    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError("Could not create user, please try again", 500);
        return next(error);
    }

    if (image) {
        try {
            imageUrl = await cloudinaryTools.uploadImage(image);
        } catch (err) {
            const error = new HttpError("Could not upload the profile picture", 500);
            return next(error);
        }
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        const userLocation = await locationService.searchCreateLocation(location, sess);
        createdUser = new User({
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: hashedPassword,
            gender: userGender,
            image: image,
            location: userLocation,
            phone: phone,
            dateOfBirth: dateOfBirth,
            tags: [],
            image: imageUrl
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
    let token;
    try {
        token = jwt.sign({ userId: createdUser.id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
    } catch (err) {
        console.log(err);
        const error = new HttpError('Creating a new user failed. Please try again later', 500);
        return next(error);
    }
    res.status(201).json({ status: "User registered", userId: createdUser.id, token: token });
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
    if (!existingUser) {
        const error = new HttpError('Invalid credentials.', 401);
        return next(error);
    }
    let isValidPassword;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError('Invalid credentials.', 500);
        return next(error);
    }
    if (!isValidPassword) {
        const error = new HttpError('Invalid credentials.', 401);
        return next(error);
    }
    let token;
    try {
        token = jwt.sign({ userId: existingUser.id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
    } catch (err) {
        console.log(err);
        const error = new HttpError('Creating a new user failed. Please try again later', 500);
        return next(error);
    }
    res.json({ message: 'Logged in!', userId: existingUser.id, token: token });
};

exports.getProfile = getProfile;
exports.patchProfile = patchProfile;
exports.getUser = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
