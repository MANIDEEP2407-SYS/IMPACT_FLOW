import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  semester: { type: Number, required: true },
  section: String,
  department: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinCode: { type: String, required: true, unique: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
