require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';
  const email = (process.env.SUPER_ADMIN_EMAIL || 'admin@schoolerp.com').toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Super admin already exists: ${email}`);
  } else {
    await User.create({
      name,
      email,
      password,
      role: 'super_admin',
      status: 'active',
      school: null,
    });
    console.log(`Super admin created: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
