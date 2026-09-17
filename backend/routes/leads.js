const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// Save lead (jab WhatsApp click ho)
router.post('/', async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;