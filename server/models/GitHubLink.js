import mongoose from 'mongoose';

const githubLinkSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  teamId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  githubUsername: { type: String, required: true, trim: true },
  repoOwner:      { type: String, required: true, trim: true },
  repoName:       { type: String, required: true, trim: true },
  repoUrl:        { type: String, required: true },
  isVerified:     { type: Boolean, default: false },
  lastSyncedAt:   { type: Date },
  syncError:      { type: String },
}, { timestamps: true });

githubLinkSchema.index({ userId: 1, projectId: 1 }, { unique: true });

export default mongoose.model('GitHubLink', githubLinkSchema);
