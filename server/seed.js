/**
 * seed.js  —  Creates demo faculty + student accounts for ImpactFlow
 * Run: node seed.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

await mongoose.connect(process.env.MONGO_URI);
console.log('✔  DB connected:', mongoose.connection.host);

/* ── Inline User schema (matches your existing model) ── */
const userSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['student', 'faculty'], default: 'student' },
  college:    { type: String, default: 'ImpactFlow University' },
  department: { type: String, default: 'Computer Science' },
  semester:   { type: Number },
  rollNo:     { type: String },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const DEMO_ACCOUNTS = [
  {
    name:       'Dr. Priya Sharma',
    email:      'faculty@demo.com',
    password:   'demo1234',
    role:       'faculty',
    college:    'ImpactFlow University',
    department: 'Computer Science',
  },
  {
    name:       'Arjun Reddy',
    email:      'student@demo.com',
    password:   'demo1234',
    role:       'student',
    college:    'ImpactFlow University',
    department: 'Computer Science',
    semester:   5,
    rollNo:     '22CSE001',
  },
];

for (const acc of DEMO_ACCOUNTS) {
  const existing = await User.findOne({ email: acc.email });
  if (existing) {
    console.log(`⚠  Already exists: ${acc.email} — skipping`);
    continue;
  }
  const hashed = await bcrypt.hash(acc.password, 10);
  await User.create({ ...acc, password: hashed });
  console.log(`✔  Created [${acc.role}]  ${acc.email}  /  password: ${acc.password}`);
}

console.log('\nDemo accounts ready:');
console.log('  Faculty  → faculty@demo.com   /  demo1234');
console.log('  Student  → student@demo.com   /  demo1234');

await mongoose.disconnect();
