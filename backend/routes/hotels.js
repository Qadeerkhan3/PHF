const express = require('express');
const router = express.Router();
const axios = require('axios');
const Hotel = require('../models/Hotel');

// ─── Nearby hotels (from DB) ───
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 3000 } = req.query;
    const hotels = await Hotel.find({
      status: 'Active',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Nearby hotels (from Overpass API — OpenStreetMap) ───
router.get('/nearby-google', async (req, res) => {
  try {
    const { lat, lng, radius = 3000 } = req.query;

    console.log('=== Overpass API Request ===');
    console.log('Lat:', lat, 'Lng:', lng, 'Radius:', radius);

    // ✅ SIRF HOTEL aur GUEST_HOUSE — hostel aur motel nahi
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["tourism"~"hotel|guest_house"](around:${radius},${lat},${lng});
        way["tourism"~"hotel|guest_house"](around:${radius},${lat},${lng});
        node["building"="hotel"](around:${radius},${lat},${lng});
      );
      out body center;
    `;

    // ─── Simple retry — 2 mirrors, 1 attempt each, 8 sec timeout ───
    let response = null;
    let lastError = null;

    const mirrors = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter'
    ];

    for (const mirror of mirrors) {
      try {
        console.log(`Trying: ${mirror}`);

        response = await axios.post(
          mirror,
          `data=${encodeURIComponent(overpassQuery)}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'PHF-App/1.0'
            },
            timeout: 8000
          }
        );

        console.log(`✓ Success on ${mirror}`);
        break;
      } catch (err) {
        lastError = err;
        console.log(
          `✗ Failed ${mirror}: ${err.response?.status || err.message}`
        );
      }
    }

    if (!response) {
      throw lastError;
    }

    const elements = response.data.elements || [];
    console.log('Raw elements:', elements.length);

    const places = elements
      .filter((el) => el.tags && el.tags.name)
      .map((el) => {
        const elemLat = el.lat || el.center?.lat;
        const elemLng = el.lon || el.center?.lon;
        if (!elemLat || !elemLng) return null;

        return {
          id: `osm-${el.type}-${el.id}`,
          displayName: { text: el.tags.name },
          formattedAddress:
            [
              el.tags['addr:housenumber'],
              el.tags['addr:street'],
              el.tags['addr:city'] || 'Peshawar'
            ]
              .filter(Boolean)
              .join(', ') || 'Address not available',
          rating: null,
          userRatingCount: null,
          internationalPhoneNumber:
            el.tags.phone || el.tags['contact:phone'] || null,
          websiteUri:
            el.tags.website ||
            el.tags['contact:website'] ||
            el.tags.url ||
            null,
          googleMapsUri: `https://www.openstreetmap.org/${el.type}/${el.id}`,
          location: { latitude: elemLat, longitude: elemLng },
          photos: [],
          source: 'OpenStreetMap'
        };
      })
      .filter(Boolean);

    const uniquePlaces = places.filter(
      (place, index, self) =>
        index ===
        self.findIndex((p) => p.displayName.text === place.displayName.text)
    );

    console.log('Returning:', uniquePlaces.length);
    res.json(uniquePlaces);
  } catch (err) {
    console.error('=== Overpass FINAL ERROR ===');
    console.error('Status:', err.response?.status);
    console.error('Message:', err.message);

    // Empty array return karo — frontend friendly message dikhayega
    res.json([]);
  }
});

// ─── Google Photo Proxy (compatibility) ───
router.get('/photo-proxy', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || !process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(400).json({ error: 'Missing params' });
    }

    const photoUrl = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=400&maxWidthPx=600&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(photoUrl, { responseType: 'stream' });

    res.set('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (err) {
    console.error('Photo proxy error:', err.message);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

// ─── Search hotels by name ───
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

// ─── Single hotel detail ───
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;