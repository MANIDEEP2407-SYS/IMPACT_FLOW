import mongoose from 'mongoose';

const codeFileSchema = new mongoose.Schema({
  team:          { type: mongoose.Schema.Types.ObjectId, ref: 'Team',    required: true },
  project:       { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  uploadedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  originalName:  { type: String, required: true },       // e.g. App.js
  cloudinaryUrl: { type: String, required: true },
  publicId:      { type: String, required: true },
  mimeType:      { type: String },
  sizeBytes:     { type: Number },
  versionNumber: { type: Number, required: true },        // per originalName within team
}, { timestamps: true });

export default mongoose.model('CodeFile', codeFileSchema);
