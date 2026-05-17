/**
 * seed.js  —  Creates demo faculty + student accounts for ImpactFlow
 * Run: node seed.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

await mongoose.connect(process.env.MONGO_URI);
console.log('✔  DB connected:', mongoose.connection.host);

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
    name:       'Dr. Ananya Menon',
    email:      'faculty2@demo.com',
    password:   'demo1234',
    role:       'faculty',
    college:    'ImpactFlow University',
    department: 'Information Technology',
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
  {
    name:       'Meera Nair',
    email:      'student2@demo.com',
    password:   'demo1234',
    role:       'student',
    college:    'ImpactFlow University',
    department: 'Computer Science',
    semester:   4,
    rollNo:     '22CSE002',
  },
  {
    name:       'Rahul Verma',
    email:      'student3@demo.com',
    password:   'demo1234',
    role:       'student',
    college:    'ImpactFlow University',
    department: 'Computer Science',
    semester:   6,
    rollNo:     '22CSE003',
  },
  {
    name:       'Sneha Iyer',
    email:      'student4@demo.com',
    password:   'demo1234',
    role:       'student',
    college:    'ImpactFlow University',
    department: 'Computer Science',
    semester:   5,
    rollNo:     '22CSE004',
  },
  {
    name:       'Karthik Rao',
    email:      'student5@demo.com',
    password:   'demo1234',
    role:       'student',
    college:    'ImpactFlow University',
    department: 'Computer Science',
    semester:   7,
    rollNo:     '22CSE005',
  },
];

for (const acc of DEMO_ACCOUNTS) {
  const existing = await User.findOne({ email: acc.email });
  if (existing) {
    existing.name = acc.name;
    existing.password = acc.password;
    existing.role = acc.role;
    existing.college = acc.college;
    existing.department = acc.department;
    existing.semester = acc.semester;
    existing.rollNo = acc.rollNo;
    await existing.save();
    console.log(`✔  Updated [${acc.role}]  ${acc.email}  /  password: ${acc.password}`);
    continue;
  }

  await User.create(acc);
  console.log(`✔  Created [${acc.role}]  ${acc.email}  /  password: ${acc.password}`);
}

console.log('\nDemo accounts ready:');
console.log('  Faculty  → faculty@demo.com    /  demo1234');
console.log('  Faculty  → faculty2@demo.com   /  demo1234');
console.log('  Students → student@demo.com    /  demo1234');
console.log('            student2@demo.com   /  demo1234');
console.log('            student3@demo.com   /  demo1234');
console.log('            student4@demo.com   /  demo1234');
console.log('            student5@demo.com   /  demo1234');

await mongoose.disconnect();
