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

// ─── Nearby hotels (from Geoapify API) ───
router.get('/nearby-google', async (req, res) => {
  try {
    const { lat, lng, radius = 3000 } = req.query;

    console.log('=== Geoapify API Request ===');
    console.log('Lat:', lat, 'Lng:', lng, 'Radius:', radius);

    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
      console.error('GEOAPIFY_API_KEY missing in .env');
      return res.status(500).json({ error: 'Geoapify API key not configured' });
    }

    //  Nearby Hotels Search
    
    const searchUrl = `https://api.geoapify.com/v2/places?categories=accommodation.hotel,accommodation.guest_house&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=20&lang=en&apiKey=${apiKey}`;

    console.log('Geoapify search URL:', searchUrl);

    const searchResponse = await axios.get(searchUrl, {
      timeout: 8000 // Vercel 10s limit ke andar rehne ke liye 8 sec
    });

    const features = searchResponse.data.features || [];
    console.log('Hotels found nearby:', features.length);

    if (features.length === 0) {
      return res.json([]);
    }

    // ─── Step 2: Fetch Website for each hotel (Place Details API) ───
    // Har hotel ka place_id lekar website nikalo (Parallel mein)
    const detailedPlaces = await Promise.all(
      features.map(async (feature) => {
        const placeId = feature.properties.place_id;

        // Agar place_id nahi hai toh basic data hi do
        if (!placeId) {
          return mapBasicData(feature);
        }

        try {
          // Place Details API call (website ke liye)
          const detailsUrl = `https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${apiKey}`;
          
          const detailsResponse = await axios.get(detailsUrl, {
            timeout: 5000 // Extra timeout
          });

          const details = detailsResponse.data.features?.[0]?.properties || {};
          
          return {
            id: feature.properties.place_id || `geo-${Math.random()}`,
            displayName: { text: details.name || feature.properties.name || 'Unknown Hotel' },
            formattedAddress: details.formatted || feature.properties.formatted || 'Address not available',
            rating: null, // Geoapify basic search mein rating nahi hoti
            userRatingCount: null,
            internationalPhoneNumber: details.phone || null,
            websiteUri: details.website || null, // <--- YEH WEBSITE FIELD HAI
            googleMapsUri: null,
            location: {
              latitude: feature.geometry.coordinates[1],
              longitude: feature.geometry.coordinates[0]
            },
            photos: [],
            source: 'Geoapify'
          };
        } catch (err) {
          console.error(`Details failed for place ${placeId}:`, err.message);
          // Agar details fail ho jaye toh basic data return karo
          return mapBasicData(feature);
        }
      })
    );

    console.log('Returning detailed hotels:', detailedPlaces.length);
    res.json(detailedPlaces);

  } catch (err) {
    console.error('=== Geoapify FINAL ERROR ===');
    console.error('Status:', err.response?.status);
    console.error('Message:', err.message);

    // Fallback: Agar error aaye toh empty array return karo
    res.json([]);
  }
});

// Helper function — Basic data map karne ke liye (agar details fail ho jaye)
function mapBasicData(feature) {
  return {
    id: feature.properties.place_id || `geo-${Math.random()}`,
    displayName: { text: feature.properties.name || 'Unknown Hotel' },
    formattedAddress: feature.properties.formatted || 'Address not available',
    rating: null,
    userRatingCount: null,
    internationalPhoneNumber: null,
    websiteUri: null,
    googleMapsUri: null,
    location: {
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0]
    },
    photos: [],
    source: 'Geoapify'
  };
}

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