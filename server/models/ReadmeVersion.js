import mongoose from 'mongoose';

const readmeVersionSchema = new mongoose.Schema({
  team:          { type: mongoose.Schema.Types.ObjectId, ref: 'Team',    required: true },
  project:       { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  content:       { type: String, required: true },
  editedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  versionNumber: { type: Number, required: true },
  summary:       { type: String, default: '' },          // optional commit message
}, { timestamps: true });

export default mongoose.model('ReadmeVersion', readmeVersionSchema);
