import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], required: true },
  college: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: Number, min: 1, max: 8 },
  rollNo: String,
  profilePicture: String,
  // Profile fields
  bio: { type: String, default: '', trim: true },
  skills: [{ type: String, trim: true }],
  domains: [{ type: String, trim: true }],
  techStack: [{ type: String, trim: true }],
  avatar: { type: String, default: '' },
  github: { type: String, default: '', trim: true },
  linkedin: { type: String, default: '', trim: true },
  timezone: { type: String, default: 'UTC' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
