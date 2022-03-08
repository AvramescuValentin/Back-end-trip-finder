const HttpError = require('../models/http-error');
const mongoose = require("mongoose");
const LocationService = require('../models/location');

const searchCreateLocation = async (obj, sess) => {
    // const location = JSON.parse(obj);
    const location = obj;
    let createdLocation;
    try {
        createdLocation = await LocationService.findOne({country: location.country, location: location.location});
        if (!createdLocation) {
            createdLocation = new LocationService({
                country: location.country,
                location: location.location
            });
            await createdLocation.save({session:sess});
        }
    } catch (err) {
        throw 2;
    }
    return createdLocation;
}

exports.searchCreateLocation = searchCreateLocation;
