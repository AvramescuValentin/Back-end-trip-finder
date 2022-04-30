require('dotenv').config();

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (data) => {
    try {
        const fileStr = data;
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            upload_preset: 'dizwr2na',
        });
        return uploadResponse.secure_url;
    } catch (err) {
        console.error(err);
        console.error("Could not upload file in Cloudinary");
        throw "Could not upload file in Cloudinary";
    }
}

exports.uploadImage = uploadImage;
