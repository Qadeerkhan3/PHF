const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// ─── Save lead (with duplicate prevention) ───
router.post('/', async (req, res) => {
  try {
    const {
      hotelId,
      hotelName,
      roomType,
      persons,
      priceShown,
      userLocation
    } = req.body;

    // ═══════════════════════════════════════════════════
    // DUPLICATE CHECK — same hotel + room, 5 min ke andar
    // ═══════════════════════════════════════════════════
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const existingLead = await Lead.findOne({
      hotelId,
      roomType,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (existingLead) {
      console.log('Duplicate lead — skipping');
      return res.json({
        message: 'Lead already exists',
        duplicate: true,
        lead: existingLead
      });
    }

    // ─── Naya lead save karo ───
    const lead = new Lead({
      hotelId,
      hotelName,
      roomType,
      persons,
      priceShown,
      userLocation,
      status: 'New'
    });

    await lead.save();
    console.log('✓ Lead saved:', hotelName, roomType);
    res.status(201).json(lead);
  } catch (err) {
    console.error('Lead save error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;