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

exports.transalateGroup = transalateGroup;
