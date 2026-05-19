import mongoose from 'mongoose';

const teamInviteSchema = new mongoose.Schema({
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team:     { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  project:  { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status:   { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

/* Prevent duplicate pending invites */
teamInviteSchema.index({ sender: 1, receiver: 1, team: 1, status: 1 });

export default mongoose.model('TeamInvite', teamInviteSchema);
