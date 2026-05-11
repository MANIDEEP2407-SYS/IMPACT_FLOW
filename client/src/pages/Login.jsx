import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import useAuthStore from '../store/authStore.js';
import Spinner from '../components/Spinner.jsx';

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setUser(data.user);
      navigate(data.user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">New here? <Link to="/register" className="text-indigo-600 hover:underline">Create account</Link></p>

        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2">{error}</div>}

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" />
          <input type="password" placeholder="Password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input" />
          <button type="submit" disabled={loading} className="btn-primary mt-2 flex items-center justify-center gap-2">
            {loading && <Spinner size="sm" />} Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
