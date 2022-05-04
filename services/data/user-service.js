const HttpError = require('../../models/http-error');
const mongoose = require("mongoose");
const LocationService = require('../../models/location');

const translateUser = (user) => {
    let parsedUser = {};
    parsedUser.dateOfBirth = user.dateOfBirth;
    parsedUser.email = user.email;
    parsedUser.firstName = user.firstName;
    parsedUser.lastName = user.lastName;
    parsedUser.id = user.id;
    parsedUser.image = user.image;
    parsedUser.gender = user.gender.value;
    parsedUser.location = user.location.location;
    parsedUser.country = user.location.country;
    parsedUser.phone = user.phone;
    parsedUser.username = user.username;
    parsedUser.tags = user.tags.map((tag) => { return tag.value });
    parsedUser.groups = user.groups.map((group) => { return group.value });

    return parsedUser;
}

exports.translateUser = translateUser;
