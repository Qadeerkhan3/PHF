const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    // Purana admin delete karo (agar hai)
    const deleted = await Admin.deleteMany({});
    console.log(`Deleted ${deleted.deletedCount} existing admin(s)`);

    // Naya strong password
    const password = 'Admin@PHF2026!';
    const hashed = await bcrypt.hash(password, 12);

    await Admin.create({
      email: 'admin@phf.com',
      password: hashed
    });

    console.log('─────────────────────────────────');
    console.log('✓ Admin created successfully');
    console.log('  Email:    admin@phf.com');
    console.log('  Password: Admin@PHF2026!');
    console.log('─────────────────────────────────');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}).catch((err) => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});