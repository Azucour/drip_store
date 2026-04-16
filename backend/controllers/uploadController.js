// controllers/uploadController.js - Image upload to Cloudinary
const { cloudinary } = require('../config/cloudinary');

// @desc    Upload single or multiple images to Cloudinary
// @route   POST /api/upload/images
// @access  Private/Admin
const uploadImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No images uploaded' });
  }

  // Extract secure URLs from uploaded files
  const imageUrls = req.files.map((file) => file.path);

  res.json({
    success: true,
    message: `${imageUrls.length} image(s) uploaded successfully`,
    imageUrls,
  });
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/images
// @access  Private/Admin
const deleteImage = async (req, res) => {
  const { publicId } = req.body;

  if (!publicId) {
    return res.status(400).json({ success: false, message: 'Public ID is required' });
  }

  await cloudinary.uploader.destroy(publicId);
  res.json({ success: true, message: 'Image deleted successfully' });
};

module.exports = { uploadImages, deleteImage };
