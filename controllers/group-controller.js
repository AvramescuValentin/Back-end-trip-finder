const { validationResult } = require('express-validator');
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const HttpError = require('../models/http-error');
const Group = require('../models/group');
const User = require('../models/user');
const locationService = require('../services/data/location-service');
const tagService = require('../services/data/tags-service');
const cloudinaryTools = require("./../services/files/cloudinaryTools");
const groupDataService = require("./../services/data/group-service");
const { param } = require('../routes/user-routes');


const getGroupById = async (req, res, next) => {
    const groupId = req.params.pid;
    let group;
    try {
        group = await Group.findById(groupId);
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find place', 500);
        return next(error);
    }
    ;


    if (!group) {
        return next(new HttpError('Could not find a group with this id', 404));
    }

    res.status(201).json({ group: group.toObject({ getters: true }) });
};

const getGroupsByUserId = async (req, res, next) => {
    let user, parsedGroups;
    try {
        user = await User.findById(req.userData.userId).populate('groups');
    } catch (err) {
        const error = new HttpError("Could not retrieve user. Please try again later", 500);
        return next(error);
    }

    try {
        const groupIds = user.groups.map(group => { return group.id });
        const groups = await Group.find({ '_id': { $in: groupIds }, 'isDeleted': false }).populate('location');
        parsedGroups = groups.map(group => { return groupDataService.transalateGroup(group) });
    }
    catch (err) {
        const error = new HttpError("Could not retrieve groups. Please try again later", 500);
        return next(error);
    }
    res.status(201).json({ groups: parsedGroups })
};

const getGroupNewsFeed = async (req, res, next) => {
    let parsedGroups;

    try {
        const groups = await Group.find({ isPrivate: "no", isDeleted: false }).populate('location');
        parsedGroups = groups.map(group => { return groupDataService.transalateGroup(group) });
    }
    catch (err) {
        const error = new HttpError("Could not retrieve groups. Please try again later", 500);
        return next(error);
    }
    const reversedGroupArray = parsedGroups.reverse();
    res.status(201).json({ groups: reversedGroupArray })
};


const createGroup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError('Invalid inputs passed, please check your data.', 422);
        return next(err);
    }
    let user, createdGroup, hashedPassword, imageUrl;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError("Could not retrieve user. Please try again later", 500);
        return next(error);
    }

    const sess = await mongoose.startSession();
    sess.startTransaction();

    if (req.body.isPrivate === 'yes') {
        try {
            hashedPassword = await bcrypt.hash(req.body.password, 12);
        } catch (err) {
            const error = new HttpError("Could not create user, please try again", 500);
            return next(error);
        }
    }

    if (req.body.image) {
        try {
            imageUrl = await cloudinaryTools.uploadImage(req.body.image);
        } catch (err) {
            const error = new HttpError("Could not upload the profile picture", 500);
            return next(error);
        }
    }

    try {
        const groupLocation = await locationService.searchCreateLocation(req.body.location, sess);
        createdGroup = new Group({
            title: req.body.title,
            description: req.body.description,
            generatedId: `${Date.now()}`,
            isPrivate: req.body.isPrivate,
            password: hashedPassword,
            imageUrl: imageUrl || null,
            location: groupLocation,
            tags: [],
            tripDateStart: req.body.startDate,
            tripDateEnd: req.body.endDate,
            creator: user,
            members: [user],
            posts: []
        })
        if (req.body.tags) {
            await tagService.searchCreateTags(req.body.tags, createdGroup, sess);
        }
        await createdGroup.save({ session: sess });
        user.groups.push(createdGroup);
        user.save({ session: sess })
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Creating a new group failed. Please try again later', 500);
        return next(error);
    }
    res.status(201).json({ status: "User registered", group: createdGroup });
};

const updateGroup = async (req, res, next) => {
    const { title, description } = req.body;
    const groupId = req.params.pid;

    let group;
    try {
        group = await Group.findById(groupId);
    } catch (err) {
        const error = new HttpError('Something went wrong. Please try again later', 500);
        return next(error);
    }

    group.title = title;
    group.description = description;

    try {
        await group.save();
    } catch (err) {
        const error = new HttpError('Something went wrong. Please try again later', 500);
        return next(error);
    }

    res.status(200).json({ group: group.toObject({ getters: true }) });
};

const deleteGroup = async (req, res, next) => {
    const groupId = req.params.groupId;
    let group;
    try {
        group = await Group.findById(groupId).populate('creator').populate('members');
    } catch (err) {
        const error = new HttpError('Something went wrong. Please try again later', 500);
        return next(error);
    }
    if (!group) {
        const error = new HttpError("We could not found any group with this ID", 404);
        return next(error);
    }
    if (group.creator.id === req.userData.userId) {
        try {
            group.isDeleted = true;
            group.save();
        } catch (err) {
            console.log(err);
            const error = new HttpError('Could not delete the group now. Please try again later', 500);
            return next(error);
        }
    }
    else {
        const error = new HttpError("The user is not the creator", 403);
        return next(error);
    }
    res.status(200).json({ message: "data deleted!" });
};

const applyForGroup = async (req, res, next) => {
    let group, user;
    if (req.body.generatedId) {
        try {
            group = await Group.findOne({ generatedId: req.body.generatedId });
        } catch (err) {
            const error = new HttpError('Could not retrieve group. Please try again later', 500);
            return next(error);
        }
    }
    else {
        const groupId = req.params.groupId;
        try {
            group = await Group.findById(groupId);
        } catch (err) {
            const error = new HttpError('Could not retrieve group. Please try again later', 500);
            return next(error);
        }
    }

    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError("Could not retrieve user. Please try again later", 500);
        return next(error);
    }


    if (group.isPrivate === "no") {
        try {
            await groupDataService.registerUserInGroup(user, group);
        } catch (err) {
            const error = new HttpError("Could not add user to the group. Please try again later", 500);
            return next(error);
        }
    }
    else {
        let isValidPassword;
        try {
            isValidPassword = await bcrypt.compare(req.body.password, group.password);
        } catch (err) {
            const error = new HttpError('Invalid credentials.', 500);
            return next(error);
        }

        if (!isValidPassword) {
            const error = new HttpError('Invalid credentials.', 401);
            return next(error);
        }

        try {
            await groupDataService.registerUserInGroup(user, group);
        } catch (err) {
            const error = new HttpError("Could not add user to the group. Please try again later", 500);
            return next(error);
        }

    }
    res.status(201).json({ message: 'User registered' })
}

const leaveGroup = async (req, res, next) => {
    let user, group;

    const groupId = req.params.groupId;
    try {
        group = await Group.findById(groupId);
    } catch (err) {
        const error = new HttpError('Could not retrieve group. Please try again later', 500);
        return next(error);
    }
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError("Could not retrieve user. Please try again later", 500);
        return next(error);
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await user.groups.pull(group);
        await user.save({ session: sess });
        await group.members.pull(user);
        await group.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError("Could not leave group. Please try again later", 500);
        return next(error);
    }
    res.status(200).json({ message: "User leaved group!" });
}

exports.getGroupNewsFeed = getGroupNewsFeed;
exports.getGroupById = getGroupById;
exports.getGroupsByUserId = getGroupsByUserId;
exports.createGroup = createGroup;
exports.updateGroup = updateGroup;
exports.deleteGroup = deleteGroup;
exports.applyForGroup = applyForGroup;
exports.leaveGroup = leaveGroup;
