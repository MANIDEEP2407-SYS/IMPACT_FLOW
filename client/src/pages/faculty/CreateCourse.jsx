import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Spinner from '../../components/Spinner.jsx';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', code: '', semester: '', section: '', department: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function change(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/courses', { ...form, semester: Number(form.semester) });
      navigate(`/faculty/courses/${data.course._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-lg mx-auto w-full">
          <h1 className="text-xl font-bold mb-6">Create Course</h1>
          {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2">{error}</div>}
          <form onSubmit={submit} className="card flex flex-col gap-4">
            <div>
              <label className="label">Course name</label>
              <input name="name" required value={form.name} onChange={change} className="input" placeholder="e.g. Advanced Web Development" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Course code</label>
                <input name="code" required value={form.code} onChange={change} className="input" placeholder="e.g. CS401" />
              </div>
              <div>
                <label className="label">Semester</label>
                <input name="semester" type="number" min="1" max="8" required value={form.semester} onChange={change} className="input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Section</label>
                <input name="section" value={form.section} onChange={change} className="input" placeholder="e.g. A" />
              </div>
              <div>
                <label className="label">Department</label>
                <input name="department" required value={form.department} onChange={change} className="input" placeholder="e.g. CSE" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
              {loading && <Spinner size="sm" />} Create course
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
