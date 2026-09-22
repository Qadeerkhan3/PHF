const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const Hotel = require('../models/Hotel');
const Lead = require('../models/Lead');

// ─── Login (with validation) ───
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: admin._id, email: admin.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        admin: { email: admin.email }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// ─── Auth middleware ───
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    req.adminEmail = decoded.email;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired, please login again' });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ═══════════════════════════════════════════════════
// Change Password — NEW ROUTE
// ═══════════════════════════════════════════════════
router.put(
  '/change-password',
  auth,
  [
    body('currentPassword')
      .isLength({ min: 6 })
      .withMessage('Current password required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be 8+ characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const { currentPassword, newPassword } = req.body;

      const admin = await Admin.findById(req.adminId);
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      // Current password verify
      const isValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Naya password same na ho
      const isSame = await bcrypt.compare(newPassword, admin.password);
      if (isSame) {
        return res
          .status(400)
          .json({ error: 'New password must be different from current' });
      }

      // Hash karo aur save karo
      const hashed = await bcrypt.hash(newPassword, 12);
      admin.password = hashed;
      await admin.save();

      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      console.error('Change password error:', err);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
);

// ─── Hotels ───

router.get('/hotels', auth, async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  '/hotels',
  auth,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Hotel name 2-100 chars'),
    body('phone').trim().isLength({ min: 7, max: 20 }).withMessage('Valid phone required'),
    body('whatsapp').trim().isLength({ min: 7, max: 20 }).withMessage('Valid WhatsApp required'),
    body('address').trim().isLength({ min: 5, max: 200 }).withMessage('Address 5-200 chars'),
    body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const hotel = new Hotel(req.body);
      await hotel.save();
      res.status(201).json(hotel);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put('/hotels/:id', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/hotels/:id', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Leads ───

router.get('/leads', auth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/leads/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Analytics ───

router.get('/analytics', auth, async (req, res) => {
  try {
    const totalHotels = await Hotel.countDocuments();
    const totalLeads = await Lead.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const leadsToday = await Lead.countDocuments({ createdAt: { $gte: today } });

    res.json({ totalHotels, totalLeads, leadsToday });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;