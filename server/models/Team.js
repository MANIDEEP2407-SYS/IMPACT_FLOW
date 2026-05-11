import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teamLead: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
  }],
  status: { type: String, enum: ['pending', 'active', 'rejected'], default: 'pending' },
  contributionScores: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number,
  }],
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
