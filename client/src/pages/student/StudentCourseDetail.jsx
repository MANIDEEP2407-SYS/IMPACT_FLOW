import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function StudentCourseDetail() {
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/${id}/projects`).then(r => { setProjects(r.data.projects); setLoading(false); });
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <h1 className="text-xl font-bold mb-6">Projects</h1>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : projects.length === 0 ? (
            <EmptyState title="No projects yet" message="Your faculty hasn't created any projects for this course yet." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map(p => (
                <Link key={p._id} to={`/student/projects/${p._id}`} className="card hover:shadow-md transition-shadow">
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="badge">{p.type}</span>
                    <span className="badge">{p.teamSize?.min}–{p.teamSize?.max} members</span>
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
