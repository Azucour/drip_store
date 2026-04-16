// routes/upload.js - Image upload routes
const express = require('express');
const router = express.Router();
const { uploadImages, deleteImage } = require('../controllers/uploadController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Upload up to 5 images at once
router.post('/images', protect, adminOnly, upload.array('images', 5), uploadImages);
router.delete('/images', protect, adminOnly, deleteImage);

module.exports = router;
