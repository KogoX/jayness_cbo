const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  src: { type: String, required: true }, 
  category: { type: String, required: true }, 
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  title: { type: String } 
}, { timestamps: true });

module.exports = mongoose.model('GalleryItem', gallerySchema);