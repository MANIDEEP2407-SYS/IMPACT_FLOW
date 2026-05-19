export function idsEqual(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

export function arrayHasId(items, id) {
  if (!Array.isArray(items)) return false;
  return items.some(item => idsEqual(item?._id ?? item, id));
}

export function canAccessCourse(course, user) {
  if (!course || !user) return false;
  if (user.role === 'faculty') return idsEqual(course.faculty, user._id);
  if (user.role === 'student') return arrayHasId(course.students, user._id);
  return false;
}

export function canManageCourse(course, user) {
  if (!course || !user) return false;
  return user.role === 'faculty' && idsEqual(course.faculty, user._id);
}
