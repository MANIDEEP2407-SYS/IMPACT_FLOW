import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import ScrollReveal from '../../components/ScrollReveal.jsx';

function IconBook() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
}
function IconCode() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
}
function IconCalendar() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IconLayers() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
}
function IconBuilding() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="22" x2="9" y2="18"/><line x1="15" y1="22" x2="15" y2="18"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/></svg>;
}

const FIELDS = [
  { name: 'name',       label: 'Course Name',   icon: IconBook,     placeholder: 'e.g. Advanced Web Development', full: true },
  { name: 'code',       label: 'Course Code',   icon: IconCode,     placeholder: 'e.g. CS401' },
  { name: 'semester',   label: 'Semester',       icon: IconCalendar, placeholder: '1–8', type: 'number', min: 1, max: 8 },
  { name: 'section',    label: 'Section',        icon: IconLayers,   placeholder: 'e.g. A' },
  { name: 'department', label: 'Department',     icon: IconBuilding, placeholder: 'e.g. CSE' },
];

const FEATURES = [
  'Auto join code',
  'Semester validation',
  'Section mapping',
  'Department setup',
];

export default function CreateCourse() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', code: '', semester: '', section: '', department: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  function change(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  const filled = Object.values(form).filter(Boolean).length;
  const progress = Math.round((filled / 5) * 100);

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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-xl mx-auto w-full page-enter" style={{ position: 'relative', zIndex: 1 }}>

          {/* ═══ Hero ═══ */}
          <ScrollReveal direction="up" delay={0}>
            <div className="hero-morphing relative rounded-2xl p-7 mb-8 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(13,28,45,0.92) 0%, rgba(18,33,49,0.92) 50%, rgba(19,30,140,0.28) 100%)',
                boxShadow: '0 24px 50px rgba(0,0,0,0.45), 0 0 28px rgba(129,140,248,0.12)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.35), transparent 70%)', animation: 'pulse-glow 4s ease-in-out infinite' }} />
              <div className="absolute bottom-0 left-1/4 w-28 h-28 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(60,221,199,0.28), transparent 70%)', animation: 'pulse-glow 4s ease-in-out infinite 2s' }} />

              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-faint)' }}>New Course</p>
                <h1 className="text-2xl font-black mb-1" style={{
                  background: 'linear-gradient(135deg, var(--neon-700), var(--cyber-400))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>Create a Course</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Set up a new course, generate the join code, and wire the dashboard features in one flow.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {FEATURES.map(feature => (
                    <span
                      key={feature}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ═══ Progress ═══ */}
          <ScrollReveal direction="up" delay={80}>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-glass)' }}>
                <div className="h-full rounded-full progress-bar-fill progress-shine transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-bold" style={{ color: progress === 100 ? 'var(--success-text)' : 'var(--text-muted)' }}>
                {filled}/5
              </span>
            </div>
          </ScrollReveal>

          {/* ═══ Error ═══ */}
          {error && (
            <div className="alert-error mb-5 animate-slide-up">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {/* ═══ Form ═══ */}
          <ScrollReveal direction="up" delay={150}>
            <form onSubmit={submit} className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'var(--shadow-md)',
              }}>

              {/* Top accent */}
              <div className="h-[2px] progress-shine" style={{ background: 'linear-gradient(90deg, var(--neon-500), var(--cyber-400), var(--neon-500))' }} />

              <div className="p-6 flex flex-col gap-5">
                {FIELDS.map((f, i) => {
                  const isFocused = focused === f.name;
                  const isFilled  = !!form[f.name];
                  return (
                    <div key={f.name} className={f.full ? '' : 'grid grid-cols-1'}
                      style={f.full ? {} : { gridColumn: 'span 1' }}>
                      {/* Only render grid wrapper for paired fields */}
                      <div className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                        <label className="label flex items-center gap-1.5">
                          <span style={{ width: 12, height: 12, color: isFocused ? 'var(--neon-300)' : 'var(--text-muted)' }}><f.icon /></span>
                          {f.label}
                        </label>
                        <div className="relative">
                          <input
                            name={f.name}
                            type={f.type || 'text'}
                            min={f.min}
                            max={f.max}
                            required={f.name !== 'section'}
                            value={form[f.name]}
                            onChange={change}
                            onFocus={() => setFocused(f.name)}
                            onBlur={() => setFocused(null)}
                            className="input"
                            placeholder={f.placeholder}
                          />
                          {isFilled && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="var(--success-text)" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit */}
              <div className="px-6 pb-6 pt-2">
                <button type="submit" disabled={loading}
                  className="btn-primary btn-glow w-full flex items-center justify-center gap-2 text-sm"
                  style={{ height: 44 }}>
                  {loading && <Spinner size="sm" />}
                  <span className="relative z-10">
                    {loading ? 'Creating…' : '✦ Create Course'}
                  </span>
                </button>
              </div>
            </form>
          </ScrollReveal>

          {/* ═══ Tips ═══ */}
          <ScrollReveal direction="up" delay={250}>
            <div className="mt-6 rounded-xl p-4 flex items-start gap-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px dashed rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
              }}>
              <span className="text-lg">💡</span>
              <div>
                <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--neon-300)' }}>Features</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  The course screen includes auto join code generation, semester/section validation, and a structured department setup.
                </p>
              </div>
            </div>
          </ScrollReveal>

        </main>
      </div>
    </div>
  );
}
