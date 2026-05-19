import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
}, { timestamps: true });

const discussionSchema = new mongoose.Schema({
  team:    { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:   { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  pinned:  { type: Boolean, default: false },
  replies: [replySchema],
}, { timestamps: true });

discussionSchema.index({ team: 1, createdAt: -1 });

export default mongoose.model('Discussion', discussionSchema);
