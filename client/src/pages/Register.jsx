import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import useAuthStore from '../store/authStore.js';
import Spinner from '../components/Spinner.jsx';

export default function Register() {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', college: '', department: '', semester: '', rollNo: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function change(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (form.semester) payload.semester = Number(form.semester);
      else delete payload.semester;
      if (!form.rollNo) delete payload.rollNo;
      const { data } = await api.post('/auth/register', payload);
      setUser(data.user);
      navigate(data.user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">Already have one? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link></p>

        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2">{error}</div>}

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input name="name" placeholder="Full name" required value={form.name} onChange={change} className="input" />
          <input name="email" type="email" placeholder="Email" required value={form.email} onChange={change} className="input" />
          <input name="password" type="password" placeholder="Password (min 6 chars)" required value={form.password} onChange={change} className="input" />

          <select name="role" value={form.role} onChange={change} className="input">
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>

          <input name="college" placeholder="College name" required value={form.college} onChange={change} className="input" />
          <input name="department" placeholder="Department" required value={form.department} onChange={change} className="input" />

          {form.role === 'student' && (
            <>
              <input name="semester" type="number" placeholder="Semester (1-8)" min="1" max="8" value={form.semester} onChange={change} className="input" />
              <input name="rollNo" placeholder="Roll number" value={form.rollNo} onChange={change} className="input" />
            </>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-2 flex items-center justify-center gap-2">
            {loading && <Spinner size="sm" />} Create account
          </button>
        </form>
      </div>
    </div>
  );
}
