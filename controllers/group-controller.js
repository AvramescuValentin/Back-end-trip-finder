const {validationResult} = require('express-validator');
const mongoose = require("mongoose");

const HttpError = require('../models/http-error');
const Group = require('../models/group');
const User = require('../models/user');
const locationService = require('../data_service/location-service');
const tagService = require('../data_service/tags-service');


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

    res.status(201).json({group: group.toObject({getters: true})});
};

const getGroupsByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let group;
    try {
        group = await Group.find({creator: userId});
        console.log(group);
    } catch (err) {
        const error = new HttpError('Fetching groups failed. Please try again later.', 500);
        return next(error);
    }
    ;

    if (group.length === 0 || !group) {
        return next(new HttpError('Could not find a group with provided user id', 404));
    }

    res.status(201).json({group: group.map(group => group.toObject({getters: true}))});
};

const createGroup = async (req, res, next) => {
    let user;
    const errors = validationResult(req); // valideaza componentele din req inainte de a trece mai departe si returneaza erori
    if (!errors.isEmpty()) { // daca nu e gol, i.e. exista erori, vom da throw la o eroare http
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }
    const {title, description, image, location, tags, tripDate, creator} = req.body;
    // const createdGroup = new Group({
    //     title,
    //     description,
    //     image,
    //     location,
    //     tags,
    //     creator,
    //     tripDate,
    //     members: creator
    // });
    // console.log("Avem din body");
    // console.log(createdGroup);

    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Creating group failed. Please try again later.', 500);
        return next(error);
    }
    if (!user) {
        const error = new HttpError('Could not find user for provided ID', 404);
        return next(error);
    }

    try {
        // await createdGroup.save();
        const sess = await mongoose.startSession();
        sess.startTransaction();
        const groupLocation = await locationService.searchCreateLocation(location, sess);
        const createdGroup = new Group({
            title,
            description,
            image,
            location:groupLocation,
            // tags,
            creator:user,
            tripDate,
            // members
        });
        await tagService.searchCreateTags(tags,createdGroup,sess);
        createdGroup.members.push(user);
        await createdGroup.save({session: sess}); //aici am stocat temporar grupul
        user.groups.push(createdGroup);
        await user.save({session: sess});
        await sess.commitTransaction(); // aici se salveaza tot. Daca ceva merge prost pana aici, se da drop automat
    } catch (err) {
        console.log(err);
        const error = new HttpError('Creating a new group failed. Please try again', 500);
        return next(error); // o folosim ca sa oprim executia in caz ca intervine o eroare
        //altfel executia va continua chiar daca primim o eroare.

    }
    ;


    res.status(201).json({status: "Group created with success!"});

    console.log('New group created!');
};

const updateGroup = async (req, res, next) => {
    const {title, description} = req.body;
    const groupId = req.params.pid;

    let group;
    try {
        group = await Group.findById(groupId);
    } catch (err) {
        const error = HttpError('Something went wrong. Please try again later', 500);
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

    res.status(200).json({group: group.toObject({getters: true})});
};

const deleteGroup = async (req, res, next) => {
    const groupId = req.params.pid;
    let group;
    try {
        group = await Group.findById(groupId).populate('creator');
    } catch (err) {
        const error = new HttpError('Something went wrong. Please try again later', 500);
        return next(error);
    }

    if (!group) {
        const error = new HttpError("We could not found any group with this ID", 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await group.remove({session: sess});
        group.creator.groups.pull(group);
        await group.creator.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        const error = new HttpError('Could not delete the group now. Please try again later', 500);
        return next(error);
    }
    res.status(200).json({message: "data deleted!"});
};

exports.getGroupById = getGroupById;
exports.getGroupsByUserId = getGroupsByUserId;
exports.createGroup = createGroup;
exports.updateGroup = updateGroup;
exports.deleteGroup = deleteGroup;
