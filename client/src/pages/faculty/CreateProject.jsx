import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import ScrollReveal from '../../components/ScrollReveal.jsx';

/* ─── Icons ─── */
function IconTarget() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
function IconScale() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.5C12 11 14 9 17 7l4-4"/><path d="M12 13.5C12 11 10 9 7 7l-4-4"/></svg>;
}
function IconFlag() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
}
function IconTrash() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
}
function IconPlus() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

/* ═══════════════════════════════════════
   RUBRIC BUILDER — Light Mode
   ═══════════════════════════════════════ */
function RubricBuilder({ rubric, setRubric }) {
  const total = rubric.reduce((s, r) => s + Number(r.weight || 0), 0);
  const isValid = total === 100;

  function addRow()           { setRubric(r => [...r, { criteria: '', weight: '' }]); }
  function update(i, fld, v)  { setRubric(r => r.map((row, idx) => idx === i ? { ...row, [fld]: v } : row)); }
  function remove(i)          { setRubric(r => r.filter((_, idx) => idx !== i)); }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
          style={{ color: 'var(--neon-400)' }}>
          <span style={{ width: 14, height: 14 }}><IconScale /></span>
          Rubric Criteria
        </p>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
          style={{
            background: isValid ? 'var(--success-bg)' : 'var(--danger-bg)',
            border: `1px solid ${isValid ? 'var(--success-border)' : 'var(--danger-border)'}`,
            color: isValid ? 'var(--success-text)' : 'var(--danger-text)',
          }}>
          {total}% {!isValid && '· must be 100%'}
        </span>
      </div>

      {/* Visual progress ring */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border-glass)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none"
              stroke={isValid ? '#4ade80' : total > 100 ? '#f87171' : 'var(--neon-500)'}
              strokeWidth="3" strokeDasharray={`${Math.min(total, 100) * 0.9425} 94.25`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.4s ease, stroke 0.3s ease' }} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black"
            style={{ color: isValid ? '#4ade80' : 'var(--text-muted)' }}>
            {total}%
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Add evaluation criteria that sum to <strong style={{ color: 'var(--text-secondary)' }}>100%</strong>. Each criterion defines a grading dimension.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {rubric.map((row, i) => (
          <div key={i}
            className="flex gap-2 items-center rounded-xl p-2.5 transition-all duration-200"
            style={{
              background: 'var(--border-subtle)',
              border: '1px solid var(--border-glass)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-neon)'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.background = 'var(--border-subtle)'; }}>
            <span className="text-[10px] font-black w-5 text-center shrink-0" style={{ color: 'var(--text-muted)' }}>
              {i + 1}
            </span>
            <input placeholder="Criteria name" value={row.criteria} onChange={e => update(i, 'criteria', e.target.value)} className="input flex-1" />
            <div className="relative w-20">
              <input type="number" placeholder="%" value={row.weight} onChange={e => update(i, 'weight', e.target.value)}
                className="input text-center pr-6" />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>%</span>
            </div>
            <button type="button" onClick={() => remove(i)}
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
              style={{ color: 'var(--danger-text)', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 12px rgba(239,68,68,0.2)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <span style={{ width: 12, height: 12 }}><IconTrash /></span>
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addRow}
        className="btn-secondary text-xs mt-3 flex items-center gap-1.5">
        <span style={{ width: 12, height: 12 }}><IconPlus /></span> Add Criteria
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════
   MILESTONE BUILDER — Light Mode
   ═══════════════════════════════════════ */
function MilestoneBuilder({ milestones, setMilestones }) {
  function addRow()          { setMilestones(m => [...m, { title: '', description: '', dueDate: '', order: m.length + 1 }]); }
  function update(i, fld, v) { setMilestones(m => m.map((row, idx) => idx === i ? { ...row, [fld]: v } : row)); }
  function remove(i)         { setMilestones(m => m.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, order: idx + 1 }))); }

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-1.5"
        style={{ color: 'var(--neon-400)' }}>
        <span style={{ width: 14, height: 14 }}><IconFlag /></span>
        Milestones <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(min 2)</span>
      </p>

      <div className="flex flex-col gap-3">
        {milestones.map((m, i) => (
          <div key={i}
            className="rounded-xl overflow-hidden transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-glass)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-neon)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,23,42,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.boxShadow = 'none'; }}>

            {/* Milestone number header */}
            <div className="flex items-center justify-between px-4 py-2.5"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black"
                  style={{
                    background: 'linear-gradient(135deg, var(--neon-400), var(--cyber-400))',
                    color: 'var(--text-primary)',
                    boxShadow: '0 0 10px rgba(99,102,241,0.2)',
                  }}>
                  M{i + 1}
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  {m.title || `Milestone ${i + 1}`}
                </span>
              </div>
              <button type="button" onClick={() => remove(i)}
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ color: 'var(--danger-text)', background: 'var(--danger-bg)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 10px rgba(239,68,68,0.2)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <span style={{ width: 11, height: 11 }}><IconTrash /></span>
              </button>
            </div>

            <div className="p-4 flex flex-col gap-2.5">
              <input placeholder="Milestone title" value={m.title} onChange={e => update(i, 'title', e.target.value)} className="input" />
              <input placeholder="Description (optional)" value={m.description} onChange={e => update(i, 'description', e.target.value)} className="input" />
                <input type="date" value={m.dueDate} onChange={e => update(i, 'dueDate', e.target.value)} className="input"
                  style={{ colorScheme: 'light' }} />
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addRow}
        className="btn-secondary text-xs mt-3 flex items-center gap-1.5">
        <span style={{ width: 12, height: 12 }}><IconPlus /></span> Add Milestone
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════
   CREATE PROJECT PAGE
   ═══════════════════════════════════════ */
export default function CreateProject() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [form, setForm]             = useState({ title: '', description: '', type: 'group', minTeam: 2, maxTeam: 5, totalMarks: 100 });
  const [rubric, setRubric]         = useState([{ criteria: 'Code Quality', weight: '40' }, { criteria: 'Documentation', weight: '30' }, { criteria: 'Presentation', weight: '30' }]);
  const [milestones, setMilestones] = useState([{ title: '', description: '', dueDate: '', order: 1 }, { title: '', description: '', dueDate: '', order: 2 }]);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  function change(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    const rubricWeightTotal = rubric.reduce((s, r) => s + Number(r.weight || 0), 0);
    if (rubric.length > 0 && rubricWeightTotal !== 100) { setError('Rubric weights must sum to 100%'); return; }
    if (milestones.length < 2) { setError('Add at least 2 milestones'); return; }
    setLoading(true);
    try {
      const { data } = await api.post(`/courses/${courseId}/projects`, {
        title: form.title,
        description: form.description,
        type: form.type,
        teamSize: { min: Number(form.minTeam), max: Number(form.maxTeam) },
        rubric: rubric.map(r => ({ criteria: r.criteria, weight: Number(r.weight) })),
        totalMarks: Number(form.totalMarks),
      });
      const projectId = data.project._id;
      for (const m of milestones) {
        await api.post(`/projects/${projectId}/milestones`, {
          title: m.title,
          description: m.description,
          dueDate: new Date(m.dueDate).toISOString(),
          order: m.order,
        });
      }
      navigate(`/faculty/projects/${projectId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-2xl mx-auto w-full page-enter" style={{ position: 'relative', zIndex: 1 }}>

          {/* ═══ Hero ═══ */}
          <ScrollReveal direction="up" delay={0}>
            <div className="hero-morphing relative rounded-2xl p-7 mb-8 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #eef2ff 45%, #ecfeff 100%)',
                boxShadow: '0 18px 40px rgba(99,102,241,0.08), 0 10px 24px rgba(20,184,166,0.06)',
                border: '1px solid rgba(99,102,241,0.14)',
              }}>
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full"
                style={{ background: 'radial-gradient(circle, var(--neon-50), transparent 70%)', animation: 'pulse-glow 4s ease-in-out infinite' }} />

              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-muted)' }}>New Project</p>
                <h1 className="text-2xl font-black mb-1" style={{
                  background: 'linear-gradient(135deg, var(--neon-700), var(--cyber-600))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>Create a Project</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Define milestones, rubric criteria, and team configurations.</p>
              </div>
            </div>
          </ScrollReveal>

          {/* ═══ Error ═══ */}
          {error && (
            <div className="alert-error mb-5 animate-slide-up">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-6">

            {/* ═══ Card 1 – Basic Info ═══ */}
            <ScrollReveal direction="up" delay={100}>
              <div className="rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: 'var(--shadow-md)',
                }}>
                <div className="h-[2px] progress-shine" style={{ background: 'linear-gradient(90deg, var(--neon-500), var(--cyber-400), var(--neon-500))' }} />

                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1.5"
                    style={{ color: 'var(--neon-400)' }}>
                    <span style={{ width: 14, height: 14 }}><IconTarget /></span>
                    Project Details
                  </p>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="label">Title</label>
                      <input name="title" required value={form.title} onChange={change} className="input" placeholder="e.g. Smart Campus IoT System" />
                    </div>
                    <div>
                      <label className="label">Description</label>
                      <textarea name="description" rows={3} value={form.description} onChange={change}
                        className="input resize-none" placeholder="Describe the project scope and objectives…"
                        style={{ lineHeight: 1.7 }} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="label">Type</label>
                        <select name="type" value={form.type} onChange={change} className="input">
                          <option value="group">Group</option>
                          <option value="capstone">Capstone</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Min Team</label>
                        <input name="minTeam" type="number" min="1" value={form.minTeam} onChange={change} className="input" />
                      </div>
                      <div>
                        <label className="label">Max Team</label>
                        <input name="maxTeam" type="number" min="1" value={form.maxTeam} onChange={change} className="input" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Total Marks</label>
                      <input name="totalMarks" type="number" min="1" value={form.totalMarks} onChange={change} className="input w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* ═══ Card 2 – Rubric ═══ */}
            <ScrollReveal direction="up" delay={200}>
              <div className="rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: 'var(--shadow-md)',
                }}>
                <div className="h-[2px] progress-shine" style={{ background: 'linear-gradient(90deg, var(--cyber-400), var(--neon-500), var(--cyber-400))' }} />
                <div className="p-6">
                  <RubricBuilder rubric={rubric} setRubric={setRubric} />
                </div>
              </div>
            </ScrollReveal>

            {/* ═══ Card 3 – Milestones ═══ */}
            <ScrollReveal direction="up" delay={300}>
              <div className="rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: 'var(--shadow-md)',
                }}>
                <div className="h-[2px] progress-shine" style={{ background: 'linear-gradient(90deg, var(--neon-500), var(--cyber-400), var(--neon-500))' }} />
                <div className="p-6">
                  <MilestoneBuilder milestones={milestones} setMilestones={setMilestones} />
                </div>
              </div>
            </ScrollReveal>

            {/* ═══ Submit ═══ */}
            <ScrollReveal direction="up" delay={400}>
              <button type="submit" disabled={loading}
                className="btn-primary btn-glow w-full flex items-center justify-center gap-2 text-sm"
                style={{ height: 48, borderRadius: 16 }}>
                {loading && <Spinner size="sm" />}
                <span className="relative z-10">
                  {loading ? 'Creating project…' : '🚀 Create Project'}
                </span>
              </button>
            </ScrollReveal>
          </form>

        </main>
      </div>
    </div>
  );
}
