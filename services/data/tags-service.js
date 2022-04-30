const HttpError = require('./../../models/http-error');
const mongoose = require("mongoose");
const Tags = require('./../../models/tags');
const User = require('./../../models/user');

const searchCreateTags = async (tags, target, sess) => { // tags is an array of strings
    try {
        await Promise.all(tags.map(async (element) => {
            const tag = await Tags.findOne({ value: element });
            if (!tag) {
                const newTag = new Tags({
                    value: element
                });
                await newTag.save({ session: sess });
                target.tags.push(newTag)
            }
            else {
                target.tags.push(tag)
            }
        }));
    } catch (err) {
        throw "Could not add tags to user";
    }
}

exports.searchCreateTags = searchCreateTags;
