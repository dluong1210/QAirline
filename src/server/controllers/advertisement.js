import { Advertisement } from "../models/model.js";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const uploadAdvertisement = async (req, res) => {
    try {
        console.log(req.file);
        if (!req.file) {
            return res.status(400).send({ error: 'No file uploaded' });
        }

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream((error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }).end(req.file.buffer);
        });
        console.log(uploadResult);

        res.send({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
}

export const createAdvertisement = async (req, res) => {
    const idAdmin_created = req.user.idAdmin;
    const { description, image_url } = req.body;  
    try {  
        const newAdvert = await Advertisement.create({
            description,
            image_url,
            idAdmin_created,
        })
        res.send(newAdvert);
    } catch (error) {
        res.status(500).send(err.message);
        console.log(err.message);
    }
}

export const deleteAdvertisement = async (req, res) => {
    const { idAdvertisement } = req.params;

    try {
        const advert = await Advertisement.destroy({ where: { idAdvertisement } });
        res.status(200).send({ message: "Deleted advert successfully" });
    } catch (err) {
        res.status(500).send(err.message);
        console.log(err.message);
    }
}

export const getAllAdvertisement = async (req, res) => {
    try {
        const adverts = await Advertisement.findAll();
        res.send(adverts);
    } catch (err) {
        res.status(500).send(err.message);
        console.log(err.message);
    }
}