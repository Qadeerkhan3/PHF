const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  hotelName: String,
  roomType: String,
  persons: Number,
  priceShown: Number,
  userLocation: { lat: Number, lng: Number },
  status: { type: String, default: 'New' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', LeadSchema);