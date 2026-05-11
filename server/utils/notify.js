import Notification from '../models/Notification.js';

export async function createNotification({ userId, type, message }) {
  await Notification.create({ user: userId, type, message });
}

export async function notifyMany({ userIds, type, message }) {
  const docs = userIds.map(user => ({ user, type, message }));
  await Notification.insertMany(docs);
}
