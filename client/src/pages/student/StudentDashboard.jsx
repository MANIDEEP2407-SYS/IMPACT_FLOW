import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ContributionBadge from '../../components/ContributionBadge.jsx';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/enrolled').then(r => { setCourses(r.data.courses); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">My Courses</h1>
            <Link to="/student/join" className="btn-primary text-sm">+ Join Course</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : courses.length === 0 ? (
            <EmptyState
              title="No courses joined"
              message="Ask your faculty for the 6-character join code."
              action={<Link to="/student/join" className="btn-primary text-sm">Join a course</Link>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map(c => (
                <Link key={c._id} to={`/student/courses/${c._id}`} className="card hover:shadow-md transition-shadow">
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-gray-500">{c.code} · Sem {c.semester}</p>
                  <p className="text-xs text-gray-400 mt-1">Faculty: {c.faculty?.name}</p>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
