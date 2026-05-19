import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import SEO from '../../components/SEO.jsx';
import useAuthStore from '../../store/authStore.js';

function StatCard({ label, value, tone }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(13,28,45,0.72)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 40px rgba(0,0,0,0.28)',
      }}
    >
      <p className="text-[11px] uppercase tracking-[0.18em] font-bold mb-2" style={{ color: 'var(--text-faint)' }}>
        {label}
      </p>
      <p className="text-3xl font-black" style={{ color: tone }}>{value}</p>
    </div>
  );
}

function Badge({ children, tone = 'teal' }) {
  const styles = tone === 'teal'
    ? { background: 'rgba(60,221,199,0.12)', color: '#7ef0df', border: '1px solid rgba(60,221,199,0.22)' }
    : tone === 'indigo'
      ? { background: 'rgba(129,140,248,0.12)', color: '#c7d2fe', border: '1px solid rgba(129,140,248,0.22)' }
      : { background: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.22)' };

  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold" style={styles}>
      {children}
    </span>
  );
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export default function AdminDashboard() {
  const user = useAuthStore(s => s.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const { data: response } = await api.get('/admin/dashboard');
        if (ignore) return;
        setData(response);
        setError('');
      } catch (err) {
        if (ignore) return;
        setError(err.response?.data?.error || 'Failed to load admin dashboard');
        setData(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <SEO
        title="Admin Dashboard"
        description="Platform overview for the seeded ImpactFlow demo dataset."
        keywords="admin dashboard, platform overview, ImpactFlow admin panel"
        path="/admin/dashboard"
      />
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl p-6 md:p-8">
        <div
          className="rounded-3xl p-8 mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(13,28,45,0.94), rgba(18,33,49,0.94), rgba(19,30,140,0.28))',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 50px rgba(0,0,0,0.35)',
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.22em] font-black mb-2" style={{ color: 'var(--text-faint)' }}>
            Admin Panel
          </p>
          <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#f3f7ff' }}>
            {user?.name || 'Admin'}, platform overview is live.
          </h1>
          <p className="text-sm max-w-3xl" style={{ color: 'var(--text-muted)' }}>
            This panel is tied to the reset demo dataset: one faculty, one course, 20 students, five teams of four, and the related readme/task/submission data.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="teal">Demo course: IFD401</Badge>
            <Badge tone="indigo">Join code: IFD401A</Badge>
            <Badge tone="amber">Role: admin</Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="alert-error">{error}</div>
        ) : !data ? (
          <EmptyState title="No admin data" message="The admin overview could not load." />
        ) : (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Users" value={data.summary.users} tone="#f3f7ff" />
              <StatCard label="Courses" value={data.summary.courses} tone="#7ef0df" />
              <StatCard label="Teams" value={data.summary.teams} tone="#c7d2fe" />
              <StatCard label="Submissions" value={data.summary.submissions} tone="#fcd34d" />
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(13,28,45,0.72)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3" style={{ color: 'var(--text-faint)' }}>Roles</p>
                <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex justify-between"><span>Students</span><strong>{data.summary.students}</strong></div>
                  <div className="flex justify-between"><span>Faculty</span><strong>{data.summary.faculty}</strong></div>
                  <div className="flex justify-between"><span>Admins</span><strong>{data.summary.admins}</strong></div>
                </div>
              </div>
              <div className="rounded-2xl p-5" style={{ background: 'rgba(13,28,45,0.72)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3" style={{ color: 'var(--text-faint)' }}>Team health</p>
                <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex justify-between"><span>Active teams</span><strong>{data.summary.activeTeams}</strong></div>
                  <div className="flex justify-between"><span>Pending teams</span><strong>{data.summary.pendingTeams}</strong></div>
                  <div className="flex justify-between"><span>AI flags</span><strong>{data.summary.aiFlags}</strong></div>
                </div>
              </div>
              <div className="rounded-2xl p-5" style={{ background: 'rgba(13,28,45,0.72)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs uppercase tracking-[0.18em] font-bold mb-3" style={{ color: 'var(--text-faint)' }}>Content</p>
                <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex justify-between"><span>Readme versions</span><strong>{data.summary.readmeVersions}</strong></div>
                  <div className="flex justify-between"><span>Tasks</span><strong>{data.summary.tasks}</strong></div>
                  <div className="flex justify-between"><span>Invites</span><strong>{data.summary.invites}</strong></div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(13,28,45,0.72)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs uppercase tracking-[0.18em] font-bold mb-4" style={{ color: 'var(--text-faint)' }}>Courses</p>
                <div className="space-y-3">
                  {data.courses.map(course => (
                    <div key={course._id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm" style={{ color: '#f3f7ff' }}>{course.name}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{course.code} · {course.department} · {course.students?.length || 0} students</p>
                        </div>
                        <Badge tone="teal">{course.joinCode}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: 'rgba(13,28,45,0.72)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs uppercase tracking-[0.18em] font-bold mb-4" style={{ color: 'var(--text-faint)' }}>Recent activity</p>
                <div className="space-y-3 max-h-[460px] overflow-auto pr-1">
                  {data.recentActivity.map((item, index) => (
                    <div key={`${item.type}-${index}`} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center justify-between gap-3">
                        <Badge tone={item.type === 'submission' ? 'amber' : item.type === 'readme' ? 'indigo' : 'teal'}>{item.type}</Badge>
                        <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{formatDate(item.createdAt)}</span>
                      </div>
                      <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{item.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(13,28,45,0.72)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs uppercase tracking-[0.18em] font-bold mb-4" style={{ color: 'var(--text-faint)' }}>Teams</p>
                <div className="space-y-3">
                  {data.teams.map(team => (
                    <div key={team._id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm" style={{ color: '#f3f7ff' }}>{team.name}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{team.project?.title || 'No project'} · {team.members?.length || 0} members</p>
                        </div>
                        <Badge tone={team.status === 'active' ? 'teal' : 'amber'}>{team.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: 'rgba(13,28,45,0.72)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs uppercase tracking-[0.18em] font-bold mb-4" style={{ color: 'var(--text-faint)' }}>Quick notes</p>
                <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <p>The seeded course is ready for faculty, student, and workspace testing.</p>
                  <p>Use faculty@demo.com to manage the course and admin@demo.com for this panel.</p>
                  <p>Each team has a README history, task logs, and one milestone submission for a full walkthrough.</p>
                  <div className="pt-2">
                    <Link to="/faculty/dashboard" className="btn-primary btn-glow text-sm inline-flex">Open faculty view</Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
