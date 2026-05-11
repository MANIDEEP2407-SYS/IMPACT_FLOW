import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  milestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  files: [{
    url: String,
    publicId: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  notes: String,
  aiFlagScore: { type: Number, default: 0 },
  aiFlagDetails: String,
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('MilestoneSubmission', submissionSchema);
