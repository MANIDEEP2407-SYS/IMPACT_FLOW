import Notification from '../models/Notification.js';

export async function getMyNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
    res.json({ notifications });
  } catch (err) { next(err); }
}

export async function markRead(req, res, next) {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

export async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ ok: true });
  } catch (err) { next(err); }
}
