import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: String,
  dueDate: { type: Date, required: true },
  order: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Milestone', milestoneSchema);
