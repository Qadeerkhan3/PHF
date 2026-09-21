const express = require("express");
const router = express.Router();
const axios = require("axios");
const Hotel = require("../models/Hotel");

// ─── Nearby hotels (from DB) ───
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 3000 } = req.query;
    const hotels = await Hotel.find({
      status: "Active",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      },
    });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Nearby hotels (from Google Places API) ───
router.get("/nearby-google", async (req, res) => {
  try {
    const { lat, lng, radius = 3000 } = req.query;

    console.log("=== Google Nearby Request ===");
    console.log("Lat:", lat, "Lng:", lng, "Radius:", radius);
    console.log("API Key present:", !!process.env.GOOGLE_MAPS_API_KEY);

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({
        error: "Google Maps API key not configured",
      });
    }

    const response = await axios.post(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        includedTypes: ["lodging"],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: parseFloat(lat),
              longitude: parseFloat(lng),
            },
            radius: parseFloat(radius),
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.location,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri",
        },
      },
    );

    console.log("Places found:", response.data.places?.length || 0);
    res.json(response.data.places || []);
  } catch (err) {
    console.error("=== Google Places ERROR ===");
    console.error("Status:", err.response?.status);
    console.error("Data:", JSON.stringify(err.response?.data, null, 2));
    console.error("Message:", err.message);

    res.status(500).json({
      error: "Failed to fetch nearby hotels from Google",
      details: err.response?.data || err.message,
    });
  }
});

// ─── Google Photo Proxy (API key secure rakhne ke liye) ───
router.get("/photo-proxy", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || !process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(400).json({ error: "Missing params" });
    }

    const photoUrl = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=400&maxWidthPx=600&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await axios.get(photoUrl, {
      responseType: "stream",
    });

    res.set("Content-Type", response.headers["content-type"]);
    response.data.pipe(res);
  } catch (err) {
    console.error("Photo proxy error:", err.message);
    res.status(500).json({ error: "Failed to fetch photo" });
  }
});

// ─── Search hotels by name ───
router.get("/search", async (req, res) => {
  try {
    const { name } = req.query;
    const hotels = await Hotel.find({
      status: "Active",
      name: { $regex: name, $options: "i" },
    });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Single hotel detail ───
router.get("/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
