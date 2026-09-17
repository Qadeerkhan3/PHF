const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashed = await bcrypt.hash('admin123', 10);
  await Admin.create({ email: 'admin@phf.com', password: hashed });
  console.log('Admin created: admin@phf.com / admin123');
  process.exit();
});