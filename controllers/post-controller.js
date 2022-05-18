const mongoose = require("mongoose");
const HttpError = require('../models/http-error');
const Group = require('../models/group');
const User = require('../models/user');
const postDataService = require("./../services/data/post-service");


const getPosts = async (req, res, next) => {
    const groupId = req.params.groupId;
    let group, user;
    try {
        group = await Group.findById(groupId);
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find place', 500);
        return next(error);
    };
    if (!group) {
        return next(new HttpError('Could not find a group with this id', 404));
    }

    const parsedPosts = await postDataService.parsePost(group.posts);

    res.status(200).json({ posts: parsedPosts })
}


const addPost = async (req, res, next) => {
    const groupId = req.params.groupId;
    const userId = req.userData.userId;
    let group, user;
    try {
        group = await Group.findById(groupId);
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find place', 500);
        return next(error);
    };
    if (!group) {
        return next(new HttpError('Could not find a group with this id', 404));
    }
    try {
        user = await User.findById(userId).populate('groups');
    } catch (err) {
        const error = new HttpError("Could not retrieve user. Please try again later", 500);
        return next(error);
    }
    let isValid = false;

    user.groups.forEach(element => {
        if (element.id == groupId)
            isValid = true;
    });

    if (!isValid) {
        const error = new HttpError("User is not in group", 403);
        return next(error);
    }

    const post = {
        timeStamp: Date.now(),
        title: req.body.title,
        description: req.body.description,
        author: user.username
    }

    group.posts.unshift(post);
    await group.save();

    res.status(201).json({ group: group.toObject({ getters: true }) });

}

exports.getPosts = getPosts;
exports.addPost = addPost;