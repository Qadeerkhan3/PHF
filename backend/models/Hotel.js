const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  coupleFriendly: { type: Boolean, default: false },
  hasWebsite: { type: Boolean, default: false },
  websiteURL: { type: String, default: '' },
  image: { type: String, default: '' },
  roomTypes: [{
    name: String,
    persons: Number,
    price: Number,
    available: Number
  }],
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

HotelSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hotel', HotelSchema);