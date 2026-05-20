import mongoose from 'mongoose';

const VALID_DOMAINS = [
  'AI/ML', 'Healthcare', 'Sustainability', 'Education', 'IoT',
  'Web Development', 'Cybersecurity', 'Finance', 'Logistics',
  'Agriculture', 'Social Impact', 'Entertainment', 'Other',
];

const projectREADMEMetaSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  teamId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  problemStatement: {
    text:      { type: String, default: '' },
    wordCount: { type: Number, default: 0 },
    isValid:   { type: Boolean, default: false },  // >= 150 words
  },

  projectDomain: {
    type: String,
    enum: VALID_DOMAINS,
  },

  techStack: [{ type: String, trim: true }],  // predefined tags

  coreFeatures: [{
    title:       { type: String, required: true },
    description: { type: String },
    tokens:      [String],  // auto-generated for similarity
  }],

  systemWorkflow: {
    text:      { type: String, default: '' },
    wordCount: { type: Number, default: 0 },
    isValid:   { type: Boolean, default: false },  // >= 100 words
  },

  uniqueDifferentiators: {
    text:      { type: String, default: '' },
    wordCount: { type: Number, default: 0 },
    isValid:   { type: Boolean, default: false },  // >= 100 words
    hasVaguePhrases: { type: Boolean, default: false },
  },

  completionScore: { type: Number, default: 0 },  // 0-100, how complete the README is
  isComplete:      { type: Boolean, default: false },

  editHistory: [{
    editedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt:  { type: Date, default: Date.now },
    section:   String,
    wordsBefore: Number,
    wordsAfter:  Number,
  }],
}, { timestamps: true });

export const VALID_README_DOMAINS = VALID_DOMAINS;

export default mongoose.model('ProjectREADMEMeta', projectREADMEMetaSchema);
