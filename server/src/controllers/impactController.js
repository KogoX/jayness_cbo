const Testimonial = require('../models/Testimonial');
const GalleryItem = require('../models/GalleryItem');

// --- TESTIMONIALS ---
const getTestimonials = async (req, res) => {
  try {
    const data = await Testimonial.find({}).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTestimonial = async (req, res) => {
  try {
    const item = await Testimonial.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GALLERY ---
const getGallery = async (req, res) => {
  try {
    const data = await GalleryItem.find({}).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createGalleryItem = async (req, res) => {
  try {
    const item = await GalleryItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteGalleryItem = async (req, res) => {
  try {
    await GalleryItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTestimonials, createTestimonial, deleteTestimonial,
  getGallery, createGalleryItem, deleteGalleryItem
};