const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');

// Nearby hotels
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 3000 } = req.query;
    const hotels = await Hotel.find({
      status: 'Active',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      }
    });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search by name
router.get('/search', async (req, res) => {
  try {
    const { name } = req.query;
    const hotels = await Hotel.find({
      status: 'Active',
      name: { $regex: name, $options: 'i' }
    });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single hotel
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;