import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/courses/my`),
      api.get(`/courses/${id}/projects`),
    ]).then(([cr, pr]) => {
      setCourse(cr.data.courses.find(c => c._id === id));
      setProjects(pr.data.projects);
      setLoading(false);
    });
  }, [id]);

  function copyCode() {
    navigator.clipboard.writeText(course.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  if (!course) return <div className="p-8 text-gray-500">Course not found.</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold">{course.name}</h1>
                <p className="text-sm text-gray-500">{course.code} · Sem {course.semester} · {course.department}</p>
                <p className="text-sm text-gray-500 mt-1">{course.students.length} students enrolled</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg tracking-widest text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl">
                  {course.joinCode}
                </span>
                <button onClick={copyCode} className="btn-secondary text-sm">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Projects</h2>
            <Link to={`/faculty/courses/${id}/projects/new`} className="btn-primary text-sm">+ New Project</Link>
          </div>

          {projects.length === 0 ? (
            <EmptyState title="No projects yet" message="Create the first project for this course." action={<Link to={`/faculty/courses/${id}/projects/new`} className="btn-primary text-sm">Create project</Link>} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map(p => (
                <Link key={p._id} to={`/faculty/projects/${p._id}`} className="card hover:shadow-md transition-shadow">
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="badge">{p.type}</span>
                    <span className="badge">{p.teamSize?.min}–{p.teamSize?.max} members</span>
                    <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span>
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
