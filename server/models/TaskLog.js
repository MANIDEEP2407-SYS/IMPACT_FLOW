import mongoose from 'mongoose';

const taskLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  milestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', required: true },
  title: { type: String, required: true },
  description: String,
  proofFiles: [{ url: String, publicId: String, filename: String }],
  hoursSpent: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model('TaskLog', taskLogSchema);
