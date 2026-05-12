import cloudinary from '../config/cloudinary.js';
import CodeFile    from '../models/CodeFile.js';
import Team        from '../models/Team.js';
import streamifier from 'streamifier';

/* ── helpers ── */
async function assertMember(teamId, userId) {
  const team = await Team.findById(teamId);
  if (!team) throw { status: 404, message: 'Team not found' };
  const isMember = team.members.some(m => String(m.user) === String(userId));
  if (!isMember) throw { status: 403, message: 'Only team members can upload files' };
  return team;
}

function uploadToCloudinary(buffer, folder, originalName) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'raw', use_filename: true, unique_filename: true },
      (err, result) => err ? reject(err) : resolve(result),
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

/* GET /api/teams/:teamId/files */
export async function getFiles(req, res, next) {
  try {
    const { teamId } = req.params;
    if (req.user.role === 'student') await assertMember(teamId, req.user._id);

    const files = await CodeFile.find({ team: teamId })
      .sort({ originalName: 1, versionNumber: -1 })
      .populate('uploadedBy', 'name role');

    /* Group by originalName */
    const grouped = {};
    for (const f of files) {
      if (!grouped[f.originalName]) grouped[f.originalName] = [];
      grouped[f.originalName].push(f);
    }

    res.json({ files, grouped });
  } catch (err) { next(err); }
}

/* POST /api/teams/:teamId/files */
export async function uploadFiles(req, res, next) {
  try {
    const { teamId } = req.params;
    const team = await assertMember(teamId, req.user._id);

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'No files provided' });

    const saved = [];
    for (const file of req.files) {
      /* Compute version number per filename */
      const last = await CodeFile.findOne({ team: teamId, originalName: file.originalname }).sort('-versionNumber');
      const versionNumber = last ? last.versionNumber + 1 : 1;

      const result = await uploadToCloudinary(
        file.buffer,
        `impactflow/teams/${teamId}/code`,
        file.originalname,
      );

      const record = await CodeFile.create({
        team:          teamId,
        project:       team.project,
        uploadedBy:    req.user._id,
        originalName:  file.originalname,
        cloudinaryUrl: result.secure_url,
        publicId:      result.public_id,
        mimeType:      file.mimetype,
        sizeBytes:     file.size,
        versionNumber,
      });

      await record.populate('uploadedBy', 'name role');
      saved.push(record);
    }

    res.status(201).json({ files: saved });
  } catch (err) { next(err); }
}
