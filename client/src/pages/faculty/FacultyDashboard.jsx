import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Navbar from '../../components/Navbar.jsx';

export default function FacultyDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/my').then(r => { setCourses(r.data.courses); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">My Courses</h1>
            <Link to="/faculty/courses/new" className="btn-primary text-sm">+ New Course</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : courses.length === 0 ? (
            <EmptyState
              title="No courses yet"
              message="Create your first course to get started."
              action={<Link to="/faculty/courses/new" className="btn-primary text-sm">Create course</Link>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map(c => (
                <Link key={c._id} to={`/faculty/courses/${c._id}`} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      <p className="text-sm text-gray-500">{c.code} · Sem {c.semester} · {c.department}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded-lg bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-2 py-1">
                        {c.joinCode}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{c.students.length} students</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
