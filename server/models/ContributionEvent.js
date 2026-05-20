import mongoose from 'mongoose';

const contributionEventSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  teamId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },

  sourceType: {
    type: String,
    enum: ['TASK', 'WORKSPACE', 'FILE', 'README', 'DISCUSSION', 'MILESTONE', 'GITHUB'],
    required: true,
  },
  eventType: {
    type: String,
    enum: [
      'TASK_CREATED', 'TASK_COMPLETED', 'TASK_REVIEWED',
      'README_EDIT_MINOR', 'README_EDIT_MAJOR',
      'FILE_UPLOAD', 'FILE_UPDATE', 'DOCUMENTATION_UPLOAD',
      'DISCUSSION_POSTED', 'DISCUSSION_REPLY',
      'MILESTONE_SUBMITTED', 'MILESTONE_REVISED',
      'GITHUB_COMMIT', 'GITHUB_PR_OPENED', 'GITHUB_PR_MERGED', 'GITHUB_ISSUE_COMMENT',
    ],
    required: true,
  },

  referenceId:    { type: mongoose.Schema.Types.ObjectId },
  referenceModel: { type: String },  // 'TaskLog' | 'Discussion' | 'MilestoneSubmission' etc.

  baseScore:            { type: Number, required: true },
  validationMultiplier: { type: Number, default: 1.0 },  // 1.0 | 0.5 | 0
  qualityMultiplier:    { type: Number, default: 1.0 },  // 0.5 | 1.0 | 1.5
  finalScore:           { type: Number, required: true },

  qualityLevel:     { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  validationState:  { type: String, enum: ['verified', 'suspicious', 'invalid'], default: 'verified' },

  metadata: {
    description:    String,
    fileHash:       String,  // for dedup
    commitSha:      String,  // GitHub commit dedup
    prNumber:       Number,
    wordCount:      Number,
    editType:       String,  // 'minor' | 'major'
    repoUrl:        String,
    fileSize:       Number,
  },

  isSuspicious:    { type: Boolean, default: false },
  suspicionReason: { type: String },
  isValidated:     { type: Boolean, default: true },

}, { timestamps: true });

contributionEventSchema.index({ userId: 1, projectId: 1, createdAt: -1 });
contributionEventSchema.index({ teamId: 1, createdAt: -1 });
contributionEventSchema.index({ eventType: 1, userId: 1 });

export default mongoose.model('ContributionEvent', contributionEventSchema);
