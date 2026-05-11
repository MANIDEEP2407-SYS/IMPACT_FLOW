import Course from '../models/Course.js';

export async function generateUniqueJoinCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code, exists;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    exists = await Course.findOne({ joinCode: code });
  } while (exists);
  return code;
}
