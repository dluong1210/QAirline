import express from "express";
import { createAdvertisement, uploadAdvertisement, deleteAdvertisement, getAllAdvertisement } from "../controllers/advertisement.js"
import { authenticateAdmin } from "../middleware/auth.middleware.js";
import multer from 'multer';

const router = express.Router();

const storage = new multer.memoryStorage();
const upload = multer({
    storage,
});

router.post("/uploadImage", authenticateAdmin, upload.single('image'), uploadAdvertisement);
router.post("/", authenticateAdmin, createAdvertisement);
router.delete("/:idAdvertisement", authenticateAdmin, deleteAdvertisement);
router.get("/", getAllAdvertisement);

export default router;