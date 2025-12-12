const express = require('express');
const router = express.Router();
const { 
  getTestimonials, createTestimonial, deleteTestimonial,
  getGallery, createGalleryItem, deleteGalleryItem
} = require('../controllers/impactController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes (Reading)
router.get('/testimonials', getTestimonials);
router.get('/gallery', getGallery);

// Admin Routes (Writing)
router.post('/testimonials', protect, admin, createTestimonial);
router.delete('/testimonials/:id', protect, admin, deleteTestimonial);

router.post('/gallery', protect, admin, createGalleryItem);
router.delete('/gallery/:id', protect, admin, deleteGalleryItem);

module.exports = router;