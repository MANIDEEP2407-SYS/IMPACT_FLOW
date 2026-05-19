import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  type: { type: String, enum: ['group', 'capstone'], default: 'group' },
  teamSize: {
    min: { type: Number, default: 2 },
    max: { type: Number, default: 5 },
  },
  tags: [{ type: String, trim: true }],
  rubric: [{ criteria: String, weight: Number }],
  totalMarks: Number,
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
