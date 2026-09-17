const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Hotel = require('../models/Hotel');
const Lead = require('../models/Lead');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: 'Admin not found' });
    
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, admin: { email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all hotels
router.get('/hotels', auth, async (req, res) => {
  const hotels = await Hotel.find().sort({ createdAt: -1 });
  res.json(hotels);
});

// Add hotel
router.post('/hotels', auth, async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit hotel
router.put('/hotels/:id', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete hotel
router.delete('/hotels/:id', auth, async (req, res) => {
  await Hotel.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Get all leads
router.get('/leads', auth, async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 });
  res.json(leads);
});

// Update lead status
router.put('/leads/:id', auth, async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(lead);
});

// Analytics
router.get('/analytics', auth, async (req, res) => {
  const totalHotels = await Hotel.countDocuments();
  const totalLeads = await Lead.countDocuments();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const leadsToday = await Lead.countDocuments({ createdAt: { $gte: today } });
  
  res.json({ totalHotels, totalLeads, leadsToday });
});

module.exports = router;