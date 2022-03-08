const HttpError = require('../models/http-error');
const mongoose = require("mongoose");
const Tags = require('../models/tags');
const User = require('../models/user');

const searchCreateTags = async (obj, target, sess) => { // obj is an array of strings
    console.log(obj);
    // console.log(userId);
    // let user;
    // try {
    //     user = await User.findById(userId);
    // } catch (err) {
    //     throw "Could not retrieve user from DB!";
    // }
    // if (!user) {
    //     throw "User not found!";
    // }
    try {
        for (let i = 0; i < obj.length; i++) {
            let tag = await Tags.findOne({value: obj[i]});
            if (!tag) {
                const newTag = new Tags({
                    value:obj[i]
                })
                await newTag.save({session:sess});
                target.tags.push(newTag);
            } else {
                target.tags.push(tag);
            }
        }
    } catch (err) {
        throw "Could not add tags to user";
    }
}

exports.searchCreateTags = searchCreateTags;
