const HttpError = require('../../models/http-error');
const mongoose = require("mongoose");
const LocationService = require('../../models/location');

const transalateGroup = (group) => {
    let parsedGroup = {};
    parsedGroup.id = group.id;
    parsedGroup.title = group.title;
    parsedGroup.description = group.description;
    parsedGroup.generatedId = group.generatedId;
    parsedGroup.isPrivate = group.isPrivate;
    parsedGroup.location = group.location.location;
    parsedGroup.country = group.location.country;
    parsedGroup.tripDateStart = group.tripDateStart;
    parsedGroup.tripDateEnd = group.tripDateEnd;
    parsedGroup.tags = group.tags.map((tag) => { return tag.value });
    parsedGroup.dateOfBirth = group.dateOfBirth;
    parsedGroup.imageUrl = group.imageUrl;
    return parsedGroup;
}

const registerUserInGroup = async (user, group) => {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    try {
        user.groups.push(group);
        group.members.push(user);
        await user.save({ session: sess })
        await group.save({ session: sess })
    } catch (err) {
        const error = new HttpError('Updating the user and group failed. Please try again later', 500);
        return next(error);
    }
    await sess.commitTransaction();
    return true;
}

exports.transalateGroup = transalateGroup;
exports.registerUserInGroup = registerUserInGroup;
