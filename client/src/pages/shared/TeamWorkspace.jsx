import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import Spinner from '../../components/Spinner.jsx';
import useAuthStore from '../../store/authStore.js';
import SEO from '../../components/SEO.jsx';
import { rankByContribution, buildSimilarityReport, calculateCosineSimilarity } from '../../utils/dsa.js';
import InviteTab from '../../components/InviteTab.jsx';
import DiscussionTab from '../../components/DiscussionTab.jsx';

/* ── tiny toast ── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const bg = type === 'error' ? 'rgba(239,68,68,0.16)' : 'rgba(34,197,94,0.18)';
  const bc = type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.35)';
  const tc = type === 'error' ? '#fca5a5' : '#86efac';
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, padding:'12px 18px', borderRadius:12, background:bg, border:`1.5px solid ${bc}`, color:tc, fontWeight:700, fontSize:13, boxShadow:'0 12px 30px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', gap:8 }}>
      {type === 'error' ? '✕' : '✓'} {msg}
      <button onClick={onClose} style={{ marginLeft:8, background:'none', border:'none', cursor:'pointer', color:tc, fontWeight:900 }}>×</button>
    </div>
  );
}

/* ── tab button ── */
function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:'10px 18px', borderRadius:'10px 10px 0 0', border:'none', cursor:'pointer', fontSize:13, fontWeight:700, transition:'all 0.15s',
      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
      color: active ? '#d4e4fa' : '#93a6c0',
      borderBottom: active ? '2px solid #62fae3' : '2px solid transparent',
    }}>{label}</button>
  );
}

/* ═══════════════════════════════════ README TAB ══ */
function ReadmeTab({ teamId }) {
  const [content, setContent]   = useState('');
  const [summary, setSummary]   = useState('');
  const [history, setHistory]   = useState([]);
  const [latest, setLatest]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);
  const [openVer, setOpenVer]   = useState(null);

  useEffect(() => {
    api.get(`/teams/${teamId}/readme`).then(r => {
      setLatest(r.data.latest);
      setHistory(r.data.history);
      setContent(r.data.latest?.content || '# Team README\n\nWrite your project description here...');
      setLoading(false);
    }).catch(() => { setContent('# Team README\n'); setLoading(false); });
  }, [teamId]);

  async function save() {
    if (!content.trim()) return setToast({ msg:'Content cannot be empty', type:'error' });
    setSaving(true);
    try {
      const { data } = await api.post(`/teams/${teamId}/readme`, { content, summary });
      setHistory(h => [data.version, ...h]);
      setLatest(data.version);
      setSummary('');
      setToast({ msg:`Version ${data.version.versionNumber} saved!`, type:'success' });
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Save failed', type:'error' });
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg"/></div>;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}
      {/* Editor */}
      <div style={{ background:'var(--glass-bg)', border:'1.5px solid var(--glass-border)', borderRadius:16, overflow:'hidden', boxShadow:'0 20px 45px rgba(0,0,0,0.35)' }}>
        <div style={{ padding:'12px 16px', background:'linear-gradient(135deg, rgba(189,194,255,0.16), rgba(60,221,199,0.12))', borderBottom:'1px solid var(--glass-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontWeight:800, fontSize:13, color:'var(--text-primary)' }}>README.md</span>
          {latest && <span style={{ fontSize:11, color:'var(--text-faint)' }}>v{latest.versionNumber} · {latest.editedBy?.name} · {new Date(latest.createdAt).toLocaleDateString()}</span>}
        </div>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          style={{ width:'100%', minHeight:320, padding:20, fontFamily:'JetBrains Mono, monospace', fontSize:13, lineHeight:1.7, border:'none', outline:'none', resize:'vertical', color:'var(--text-secondary)', background:'rgba(5,16,31,0.78)' }}/>
      </div>
      {/* Save row */}
      <div style={{ display:'flex', gap:10 }}>
        <input value={summary} onChange={e => setSummary(e.target.value)} placeholder="Commit message (optional)…"
          style={{ flex:1, padding:'10px 14px', borderRadius:10, border:'1.5px solid var(--glass-border)', fontSize:13, outline:'none', color:'var(--text-secondary)', background:'rgba(5,16,31,0.74)' }}/>
        <button onClick={save} disabled={saving}
          className="btn-primary" style={{ minWidth:140, height:42, fontSize:13 }}>
          {saving ? <><Spinner size="sm"/> Saving…</> : 'Save Version'}
        </button>
      </div>
      {/* Version history */}
      {history.length > 0 && (
        <div style={{ background:'var(--glass-bg)', border:'1.5px solid var(--glass-border)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', background:'linear-gradient(135deg, rgba(189,194,255,0.16), rgba(60,221,199,0.12))', borderBottom:'1px solid var(--glass-border)' }}>
            <span style={{ fontWeight:800, fontSize:13, color:'var(--text-primary)' }}>Version History</span>
          </div>
          {history.map(v => (
            <div key={v._id} style={{ borderBottom:'1px solid var(--border-subtle)' }}>
              <button onClick={() => setOpenVer(openVer === v._id ? null : v._id)}
                style={{ width:'100%', padding:'12px 16px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', textAlign:'left' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ padding:'2px 8px', borderRadius:999, background:'rgba(189,194,255,0.18)', color:'#d8dbff', fontSize:11, fontWeight:800 }}>v{v.versionNumber}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)' }}>{v.summary || 'No commit message'}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:'var(--text-faint)' }}>
                  <span>{v.editedBy?.name}</span>
                  <span>·</span>
                  <span>{new Date(v.createdAt).toLocaleString()}</span>
                  <span style={{ color:'#62fae3' }}>{openVer === v._id ? '▲' : '▼'}</span>
                </div>
              </button>
              {openVer === v._id && (
                <pre style={{ margin:'0 16px 12px', padding:14, background:'rgba(5,16,31,0.72)', borderRadius:10, fontSize:12, fontFamily:'JetBrains Mono, monospace', overflowX:'auto', color:'var(--text-secondary)', border:'1px solid var(--glass-border)' }}>
                  {v.content}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════ CODE FILES TAB ══ */
function CodeFilesTab({ teamId }) {
  const [files, setFiles]       = useState([]);
  const [grouped, setGrouped]   = useState({});
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast]       = useState(null);
  const inputRef = useRef();

  function load() {
    api.get(`/teams/${teamId}/files`).then(r => { setFiles(r.data.files); setGrouped(r.data.grouped); setLoading(false); });
  }
  useEffect(load, [teamId]);

  async function upload(fileList) {
    if (!fileList?.length) return;
    setUploading(true);
    const fd = new FormData();
    [...fileList].forEach(f => fd.append('files', f));
    try {
      await api.post(`/teams/${teamId}/files`, fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      setToast({ msg:`${fileList.length} file(s) uploaded!`, type:'success' });
      load();
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Upload failed', type:'error' });
    } finally { setUploading(false); }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg"/></div>;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}
      {/* Drop zone */}
      <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        style={{ padding:40, borderRadius:16, border:`2px dashed ${dragOver ? '#62fae3' : 'rgba(255,255,255,0.2)'}`, background: dragOver ? 'rgba(98,250,227,0.12)' : 'rgba(13,28,45,0.65)', textAlign:'center', cursor:'pointer', transition:'all 0.2s' }}>
        <input ref={inputRef} type="file" multiple hidden onChange={e => upload(e.target.files)}/>
        <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#818cf8,#2dd4bf)', margin:'0 auto 12px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width:20, height:20 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <p style={{ fontWeight:700, color:'var(--text-secondary)', fontSize:14 }}>{uploading ? 'Uploading…' : 'Drop code files here or click to browse'}</p>
        <p style={{ fontSize:12, color:'var(--text-faint)', marginTop:4 }}>JS · PY · JAVA · CPP · ZIP · PDF · PNG — max 10MB each</p>
      </div>
      {/* Files table */}
      {Object.keys(grouped).length > 0 && (
        <div style={{ background:'var(--glass-bg)', border:'1.5px solid var(--glass-border)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', background:'linear-gradient(135deg, rgba(189,194,255,0.16), rgba(60,221,199,0.12))', borderBottom:'1px solid var(--glass-border)' }}>
            <span style={{ fontWeight:800, fontSize:13, color:'var(--text-primary)' }}>Uploaded Files</span>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'rgba(5,16,31,0.72)' }}>
                  {['File Name','Version','Uploaded By','Date','Download'].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:700, color:'var(--text-faint)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid var(--glass-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([name, vers]) =>
                  vers.map((f, i) => (
                    <tr key={f._id} style={{ borderBottom:'1px solid var(--border-subtle)', background: i === 0 ? 'rgba(129,140,248,0.08)' : 'transparent' }}>
                      <td style={{ padding:'10px 16px', color:'var(--text-primary)', fontWeight: i===0?700:400, fontFamily:'JetBrains Mono, monospace' }}>
                        {f.originalName}
                        {i === 0 && <span style={{ marginLeft:6, padding:'1px 6px', borderRadius:999, background:'rgba(189,194,255,0.18)', color:'#d8dbff', fontSize:10, fontWeight:800 }}>LATEST</span>}
                      </td>
                      <td style={{ padding:'10px 16px' }}><span style={{ padding:'2px 8px', borderRadius:999, background:'rgba(60,221,199,0.16)', color:'#9ff9eb', fontSize:11, fontWeight:700 }}>v{f.versionNumber}</span></td>
                      <td style={{ padding:'10px 16px', color:'var(--text-muted)' }}>{f.uploadedBy?.name}</td>
                      <td style={{ padding:'10px 16px', color:'var(--text-faint)' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding:'10px 16px' }}>
                        <a href={f.cloudinaryUrl} target="_blank" rel="noreferrer"
                          style={{ padding:'4px 12px', borderRadius:8, background:'linear-gradient(135deg,#818cf8,#2dd4bf)', color: '#051424', fontSize:11, fontWeight:700, textDecoration:'none' }}>
                          Download
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════ TASK LOGS TAB ══ */
function TaskLogsTab({ teamId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get(`/tasks/team/${teamId}`).then(r => { setTasks(r.data.tasks); setLoading(false); }).catch(() => setLoading(false));
  }, [teamId]);
  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg"/></div>;
  return (
    <div style={{ background:'var(--glass-bg)', border:'1.5px solid var(--glass-border)', borderRadius:16, overflow:'hidden' }}>
      <div style={{ padding:'12px 16px', background:'linear-gradient(135deg, rgba(189,194,255,0.16), rgba(60,221,199,0.12))', borderBottom:'1px solid var(--glass-border)' }}>
        <span style={{ fontWeight:800, fontSize:13, color:'var(--text-primary)' }}>All Task Logs · {tasks.length} entries</span>
      </div>
      {tasks.length === 0 ? <p style={{ padding:32, textAlign:'center', color:'var(--text-faint)' }}>No tasks logged yet.</p> : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:'rgba(5,16,31,0.72)' }}>
              {['Member','Task','Hours','Date','Milestone'].map(h => (
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:700, color:'var(--text-faint)', fontSize:11, textTransform:'uppercase', borderBottom:'1px solid var(--glass-border)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr key={t._id} style={{ borderBottom:'1px solid var(--border-subtle)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={{ padding:'10px 16px', fontWeight:600, color:'var(--text-primary)' }}>{t.user?.name}</td>
                  <td style={{ padding:'10px 16px', color:'var(--text-secondary)' }}>{t.title}</td>
                  <td style={{ padding:'10px 16px' }}><span style={{ padding:'2px 8px', borderRadius:999, background:'rgba(60,221,199,0.16)', color:'#9ff9eb', fontSize:11, fontWeight:700 }}>{t.hoursSpent}h</span></td>
                  <td style={{ padding:'10px 16px', color:'var(--text-faint)' }}>{new Date(t.date).toLocaleDateString()}</td>
                  <td style={{ padding:'10px 16px', color:'var(--text-muted)' }}>{t.milestone?.title || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════ OVERVIEW TAB ══ */
function OverviewTab({ team }) {
  if (!team) return null;

  /* DSA: Merge Sort — rank members by contribution score */
  const membersWithScores = (team.members || []).map(m => ({
    ...m,
    name: m.user?.name || 'Member',
    rollNo: m.user?.rollNo || m.user?.role || '',
    contributionScore: team.contributionScores?.find(s => String(s.user) === String(m.user?._id))?.score ?? 0,
  }));
  const rankedMembers = rankByContribution(membersWithScores);

  const statStyle = (bg, border) => ({ padding:'14px 16px', borderRadius:14, background:bg, border:`1.5px solid ${border}`, textAlign:'center' });
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* DSA: Contribution Leaderboard (Merge Sort) */}
      <div style={{ background:'var(--glass-bg)', border:'1.5px solid var(--glass-border)', borderRadius:16, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', background:'linear-gradient(135deg, rgba(189,194,255,0.16), rgba(60,221,199,0.12))', borderBottom:'1px solid var(--glass-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:800, fontSize:13, color:'var(--text-primary)' }}>Contribution Leaderboard</span>
          <span style={{ fontSize:10, padding:'2px 8px', borderRadius:999, background:'rgba(189,194,255,0.18)', color:'#d8dbff', border:'1px solid rgba(192,193,255,0.35)', fontWeight:700 }}>Sorted via Merge Sort</span>
        </div>
        <div style={{ padding:16, display:'flex', flexDirection:'column', gap:8 }}>
          {rankedMembers.map((m, i) => (
            <div key={m.user?._id || i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:12, background: i===0 ? 'linear-gradient(135deg, rgba(189,194,255,0.18), rgba(60,221,199,0.14))' : 'rgba(255,255,255,0.03)', border:`1.5px solid ${i===0?'rgba(189,194,255,0.35)':'var(--border-subtle)'}` }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background: i===0?'linear-gradient(135deg,#f59e0b,#d97706)':i===1?'linear-gradient(135deg,#6b7280,#9ca3af)':i===2?'linear-gradient(135deg,#b45309,#d97706)':'linear-gradient(135deg,#4f46e5,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', color: 'var(--text-primary)', fontWeight:900, fontSize:12, flexShrink:0 }}>
                {i < 3 ? ['🥇','🥈','🥉'][i] : m.rank}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)', lineHeight:1.2 }}>{m.name}</p>
                <p style={{ fontSize:11, color:'var(--text-faint)' }}>{m.rollNo}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontWeight:900, fontSize:16, color: m.contributionScore>=70?'#86efac':m.contributionScore>=40?'#fbbf24':'#fca5a5' }}>{m.contributionScore}</p>
                <p style={{ fontSize:10, color:'var(--text-faint)', fontWeight:600 }}>score</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members grid */}
      <div style={{ background:'var(--glass-bg)', border:'1.5px solid var(--glass-border)', borderRadius:16, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', background:'linear-gradient(135deg, rgba(189,194,255,0.16), rgba(60,221,199,0.12))', borderBottom:'1px solid var(--glass-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:800, fontSize:13, color:'var(--text-primary)' }}>Team Members</span>
          <span style={{ fontSize:11, padding:'2px 10px', borderRadius:999, background:team.status==='active'?'rgba(34,197,94,0.14)':'rgba(245,158,11,0.14)', color:team.status==='active'?'#86efac':'#fbbf24', border:`1px solid ${team.status==='active'?'rgba(34,197,94,0.32)':'rgba(245,158,11,0.32)'}`, fontWeight:700 }}>{team.status}</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12, padding:16 }}>
          {team.members?.map(m => (
            <div key={m.user?._id} style={{ display:'flex', flexDirection:'column', gap:10, padding:'14px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1.5px solid var(--border-subtle)', transition:'all 0.2s', cursor:'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'var(--neon-300, #a5b4fc)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#818cf8,#2dd4bf)', display:'flex', alignItems:'center', justifyContent:'center', color: '#051424', fontWeight:800, fontSize:13, flexShrink:0 }}>
                  {m.user?.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)', lineHeight:1.2 }}>{m.user?.name}</p>
                  <p style={{ fontSize:11, color:'var(--text-faint)' }}>{m.user?.rollNo || m.user?.role}</p>
                </div>
              </div>
              {String(m.user?._id) === String(team.teamLead?._id) && (
                <span style={{ fontSize:9, fontWeight:800, color:'#bdc2ff', textTransform:'uppercase', letterSpacing:'0.1em', alignSelf:'flex-start', background:'rgba(189,194,255,0.15)', padding:'2px 8px', borderRadius:4 }}>Lead</span>
              )}
              {m.user?.bio && (
                <p style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.4, marginTop:4, borderTop:'1px solid var(--border-subtle)', paddingTop:8 }}>{m.user.bio.substring(0, 60)}{m.user.bio.length > 60 ? '...' : ''}</p>
              )}
              {m.user?.skills?.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:4 }}>
                  {m.user.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} style={{ fontSize:9, padding:'2px 6px', borderRadius:4, background:'rgba(99,102,241,0.15)', color:'var(--neon-300)', fontWeight:600 }}>
                      {skill}
                    </span>
                  ))}
                  {m.user.skills.length > 3 && (
                    <span style={{ fontSize:9, padding:'2px 6px', color:'var(--text-muted)' }}>+{m.user.skills.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div style={statStyle('linear-gradient(135deg, rgba(189,194,255,0.14), rgba(189,194,255,0.08))','rgba(189,194,255,0.32)')}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--neon-400)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Project</p>
          <p style={{ fontWeight:800, fontSize:14, color:'var(--text-primary)' }}>{team.project?.title}</p>
        </div>
        <div style={statStyle('linear-gradient(135deg, rgba(60,221,199,0.14), rgba(60,221,199,0.08))','rgba(60,221,199,0.32)')}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--cyber-600)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Course</p>
          <p style={{ fontWeight:800, fontSize:14, color:'var(--text-primary)' }}>{team.course?.name}</p>
          {team.course?.section && <p style={{ fontSize:11, color:'#9ff9eb', marginTop:2 }}>Section {team.course.section}</p>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ SIMILARITY TAB ══ */
function SimilarityTab({ teamId }) {
  const [results, setResults]   = useState([]);
  const [readme, setReadme]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [compare, setCompare]   = useState('');
  const [liveScore, setLiveScore] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/teams/${teamId}/readme`).catch(() => ({ data: { latest: null } })),
    ]).then(([r]) => {
      setReadme(r.data.latest?.content || '');
      setLoading(false);
    });
  }, [teamId]);

  function runLive() {
    if (!readme || !compare) return;
    /* DSA: TF-IDF Cosine Similarity */
    setLiveScore(calculateCosineSimilarity(readme, compare));
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg"/></div>;

  const riskColor = s => s > 75 ? '#fca5a5' : s > 50 ? '#fbbf24' : '#86efac';
  const riskBg    = s => s > 75 ? 'rgba(239,68,68,0.16)' : s > 50 ? 'rgba(245,158,11,0.16)' : 'rgba(34,197,94,0.16)';
  const riskBorder= s => s > 75 ? 'rgba(239,68,68,0.34)' : s > 50 ? 'rgba(245,158,11,0.34)' : 'rgba(34,197,94,0.34)';
  const riskLabel = s => s > 75 ? 'High Risk' : s > 50 ? 'Medium' : 'Low';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Live checker */}
      <div style={{ background:'var(--glass-bg)', border:'1.5px solid var(--glass-border)', borderRadius:16, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', background:'linear-gradient(135deg, rgba(189,194,255,0.16), rgba(60,221,199,0.12))', borderBottom:'1px solid var(--glass-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:800, fontSize:13, color:'var(--text-primary)' }}>Live Similarity Checker</span>
          <span style={{ fontSize:10, padding:'2px 8px', borderRadius:999, background:'rgba(189,194,255,0.18)', color:'#d8dbff', border:'1px solid rgba(192,193,255,0.35)', fontWeight:700 }}>TF-IDF · Cosine Similarity</span>
        </div>
        <div style={{ padding:16, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', marginBottom:6 }}>Your README</p>
              <textarea value={readme} readOnly style={{ width:'100%', height:120, padding:10, borderRadius:10, border:'1.5px solid var(--glass-border)', fontSize:12, fontFamily:'JetBrains Mono, monospace', resize:'vertical', background:'rgba(5,16,31,0.72)', color:'var(--text-secondary)', outline:'none' }}/>
            </div>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', marginBottom:6 }}>Paste text to compare</p>
              <textarea value={compare} onChange={e => setCompare(e.target.value)} placeholder="Paste another team's README or any text here…" style={{ width:'100%', height:120, padding:10, borderRadius:10, border:'1.5px solid var(--glass-border)', fontSize:12, fontFamily:'JetBrains Mono, monospace', resize:'vertical', outline:'none', color:'var(--text-secondary)', background:'rgba(5,16,31,0.72)' }}/>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={runLive} className="btn-primary" style={{ height:38, fontSize:13, minWidth:160 }}>
              Analyse Similarity
            </button>
            {liveScore !== null && (
              <div style={{ padding:'8px 16px', borderRadius:10, background:riskBg(liveScore), border:`1.5px solid ${riskBorder(liveScore)}`, display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:22, fontWeight:900, color:riskColor(liveScore) }}>{liveScore}%</span>
                <div>
                  <p style={{ fontSize:12, fontWeight:800, color:riskColor(liveScore) }}>{riskLabel(liveScore)}</p>
                  <p style={{ fontSize:10, color:'var(--text-faint)' }}>similarity score</p>
                </div>
              </div>
            )}
          </div>
          <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(5,16,31,0.72)', border:'1px solid var(--glass-border)' }}>
            <p style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.6 }}>
              <strong style={{ color:'#d8dbff' }}>Algorithm:</strong> TF-IDF (Term Frequency–Inverse Document Frequency) + Cosine Similarity.
              Stop words removed. Score &gt; 50% = Medium Risk · &gt; 75% = High Risk (possible plagiarism).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ MAIN PAGE ══ */
const TABS = ['Overview', 'Discussions', 'Invites', 'README', 'Code Files', 'Task Logs', 'Similarity'];

export default function TeamWorkspace() {
  const { teamId } = useParams();
  const user = useAuthStore(s => s.user);
  const [team, setTeam]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab]     = useState('Overview');

  useEffect(() => {
    api.get(`/teams/${teamId}/workspace`)
      .then(r => { setTeam(r.data.team); setLoading(false); })
      .catch(e => { setError(e.response?.data?.error || 'Failed to load workspace'); setLoading(false); });
  }, [teamId]);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'var(--bg-app)', display:'flex', flexDirection:'column' }}>
      <Navbar/>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
        <Spinner size="lg"/><p style={{ color:'var(--text-faint)', fontSize:13 }}>Loading workspace…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:'100vh', background:'var(--bg-app)' }}>
      <Navbar/>
      <div style={{ padding:40, textAlign:'center' }}>
        <p style={{ color:'#fca5a5', fontWeight:700 }}>{error}</p>
        <Link to="/" style={{ color:'#bdc2ff', fontWeight:600, display:'block', marginTop:12 }}>← Go back</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-app)', display:'flex', flexDirection:'column' }}>
      <SEO
        title={team ? `${team.name} Workspace` : 'Team Workspace'}
        description="Collaborate with your team — shared README editor, code file versioning, task logs, contribution leaderboard, and similarity checker on ImpactFlow."
        keywords="team workspace, group project collaboration, shared README, code version control, contribution ranking, academic project"
        path={`/team/${teamId}/workspace`}
      />
      <Navbar/>
      <main style={{ flex:1, maxWidth:960, margin:'0 auto', width:'100%', padding:'24px 16px' }}>

        {/* Hero banner */}
        <div style={{ borderRadius:20, padding:'24px 28px', marginBottom:24, position:'relative', overflow:'hidden', background:'linear-gradient(135deg, rgba(13,28,45,0.92) 0%, rgba(18,33,49,0.92) 55%, rgba(3,55,49,0.3) 100%)', boxShadow:'0 24px 50px rgba(0,0,0,0.45), 0 0 28px rgba(129,140,248,0.12)', border:'1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'radial-gradient(circle,var(--border-glass),transparent)', pointerEvents:'none' }}/>
          <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--text-faint)', marginBottom:6 }}>Team Workspace</p>
          <h1 style={{ fontSize:22, fontWeight:900, color: 'var(--text-primary)', marginBottom:4, letterSpacing:'-0.02em' }}>{team?.name}</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>
            {team?.project?.title} · {team?.members?.length} members
            {team?.course?.section && ` · Section ${team.course.section}`}
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:2, borderBottom:'2px solid var(--border-subtle)', marginBottom:20 }}>
          {TABS.map(t => <Tab key={t} label={t} active={tab===t} onClick={() => setTab(t)}/>)}
        </div>

        {/* Tab content */}
        {tab === 'Overview'    && <OverviewTab team={team}/>}
        {tab === 'Discussions' && <DiscussionTab teamId={teamId} team={team} userId={user?._id}/>}
        {tab === 'Invites'     && <InviteTab teamId={teamId} team={team} userId={user?._id}/>}
        {tab === 'README'      && <ReadmeTab teamId={teamId}/>}
        {tab === 'Code Files'  && <CodeFilesTab teamId={teamId}/>}
        {tab === 'Task Logs'   && <TaskLogsTab teamId={teamId}/>}
        {tab === 'Similarity'  && <SimilarityTab teamId={teamId}/>}
      </main>
    </div>
  );
}
