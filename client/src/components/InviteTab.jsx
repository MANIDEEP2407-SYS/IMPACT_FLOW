import { useState, useEffect, useRef } from 'react';
import api from '../utils/api.js';
import Spinner from './Spinner.jsx';

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

/* ── Status pill ── */
function StatusPill({ status }) {
  const styles = {
    pending:  { bg: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.32)', color: '#fbbf24', icon: '⏳' },
    accepted: { bg: 'rgba(34,197,94,0.14)',  border: 'rgba(34,197,94,0.32)',  color: '#86efac', icon: '✓' },
    rejected: { bg: 'rgba(239,68,68,0.14)',  border: 'rgba(239,68,68,0.32)',  color: '#fca5a5', icon: '✕' },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{ fontSize:10, fontWeight:800, padding:'3px 10px', borderRadius:999, background:s.bg, border:`1.5px solid ${s.border}`, color:s.color, textTransform:'uppercase', letterSpacing:'0.05em' }}>
      {s.icon} {status}
    </span>
  );
}

/* ════════════════════════════════ MAIN COMPONENT ════════════════════════════ */
export default function InviteTab({ teamId, team, userId }) {
  const [mode, setMode]           = useState('sent');    // 'sent' | 'received'
  const [sentInvites, setSent]    = useState([]);
  const [myInvites, setMy]        = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null);

  /* search state */
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [searching, setSearching]   = useState(false);
  const [sending, setSending]       = useState(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const isLead = String(team?.teamLead?._id || team?.teamLead) === String(userId);

  /* Load data */
  useEffect(() => {
    Promise.all([
      isLead ? api.get(`/teams/${teamId}/invites`).catch(() => ({ data: { invites: [] } })) : Promise.resolve({ data: { invites: [] } }),
      api.get('/invites/my').catch(() => ({ data: { invites: [] } })),
    ]).then(([sent, my]) => {
      setSent(sent.data.invites);
      setMy(my.data.invites);
      setLoading(false);
    });
  }, [teamId, isLead]);

  /* Debounced search */
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/projects/${team?.project?._id || team?.project}/eligible-students?q=${encodeURIComponent(query)}`);
        setResults(data.students || []);
      } catch { setResults([]); }
      setSearching(false);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  /* Close search modal on outside click */
  useEffect(() => {
    function handle(e) { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false); }
    if (showSearch) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showSearch]);

  /* Send invite */
  async function handleSend(receiverId) {
    setSending(receiverId);
    try {
      const { data } = await api.post(`/teams/${teamId}/invite`, { receiverId });
      setSent(s => [data.invite, ...s]);
      setResults(r => r.filter(s => String(s._id) !== String(receiverId)));
      setToast({ msg: 'Invite sent successfully!', type: 'success' });
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Failed to send invite', type: 'error' });
    }
    setSending(null);
  }

  /* Accept invite */
  async function handleAccept(inviteId) {
    try {
      await api.put(`/invites/${inviteId}/accept`);
      setMy(m => m.map(i => i._id === inviteId ? { ...i, status: 'accepted' } : i));
      setToast({ msg: 'Invite accepted! You joined the team.', type: 'success' });
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Failed to accept', type: 'error' });
    }
  }

  /* Reject invite */
  async function handleReject(inviteId) {
    try {
      await api.put(`/invites/${inviteId}/reject`);
      setMy(m => m.map(i => i._id === inviteId ? { ...i, status: 'rejected' } : i));
      setToast({ msg: 'Invite declined.', type: 'success' });
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Failed to reject', type: 'error' });
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg"/></div>;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}

      {/* Mode toggle + Invite button */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:4, padding:3, borderRadius:12, background:'rgba(5,16,31,0.72)', border:'1px solid var(--glass-border)' }}>
          {isLead && (
            <button onClick={() => setMode('sent')} style={{ padding:'8px 16px', borderRadius:10, fontSize:12, fontWeight:700, border:'none', cursor:'pointer', transition:'all 0.15s', background: mode==='sent' ? 'linear-gradient(135deg,#818cf8,#2dd4bf)' : 'transparent', color: mode==='sent' ? '#051424' : 'var(--text-muted)' }}>
              Sent Invites
            </button>
          )}
          <button onClick={() => setMode('received')} style={{ padding:'8px 16px', borderRadius:10, fontSize:12, fontWeight:700, border:'none', cursor:'pointer', transition:'all 0.15s', background: mode==='received' ? 'linear-gradient(135deg,#818cf8,#2dd4bf)' : 'transparent', color: mode==='received' ? '#051424' : 'var(--text-muted)' }}>
            My Invites
          </button>
        </div>

        {isLead && team?.status === 'pending' && (
          <button onClick={() => { setShowSearch(true); setQuery(''); setResults([]); }}
            style={{ padding:'10px 20px', borderRadius:12, fontSize:13, fontWeight:700, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#818cf8,#2dd4bf)', color:'#051424', boxShadow:'0 4px 16px rgba(99,102,241,0.25)', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.25)'; }}>
            + Invite Member
          </button>
        )}
      </div>

      {/* Search modal overlay */}
      {showSearch && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:80 }}>
          <div ref={searchRef} style={{ width:'100%', maxWidth:520, background:'rgba(13,28,45,0.96)', border:'1.5px solid rgba(129,140,248,0.3)', borderRadius:20, boxShadow:'0 32px 64px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.15)', overflow:'hidden', animation:'fadeInUp 0.2s ease-out' }}>
            {/* Header */}
            <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--glass-border)', background:'linear-gradient(135deg, rgba(189,194,255,0.12), rgba(60,221,199,0.08))' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:800, color:'var(--text-primary)', margin:0 }}>Invite Student</h3>
                  <p style={{ fontSize:11, color:'var(--text-faint)', margin:0, marginTop:2 }}>Search by name, roll number, or email</p>
                </div>
                <button onClick={() => setShowSearch(false)} style={{ width:28, height:28, borderRadius:8, background:'rgba(239,68,68,0.14)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', fontSize:14, fontWeight:900, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
              </div>
              <div style={{ position:'relative' }}>
                <input
                  value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Type to search students…"
                  autoFocus
                  style={{ width:'100%', padding:'12px 14px 12px 38px', borderRadius:12, border:'1.5px solid var(--glass-border)', background:'rgba(5,16,31,0.78)', color:'var(--text-secondary)', fontSize:13, outline:'none', fontWeight:500 }}
                />
                <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:16, height:16 }} fill="none" stroke="var(--text-faint)" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                {searching && <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)' }}><Spinner size="sm"/></div>}
              </div>
            </div>

            {/* Results */}
            <div style={{ maxHeight:340, overflowY:'auto', padding:'8px 12px' }}>
              {query && !searching && results.length === 0 && (
                <div style={{ padding:24, textAlign:'center' }}>
                  <p style={{ fontSize:28, marginBottom:4 }}>🔍</p>
                  <p style={{ fontSize:13, color:'var(--text-muted)', fontWeight:600 }}>No eligible students found</p>
                  <p style={{ fontSize:11, color:'var(--text-faint)' }}>They may already be in a team</p>
                </div>
              )}
              {results.map(s => (
                <div key={s._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:12, marginBottom:4, transition:'all 0.15s', cursor:'pointer', background:'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#818cf8,#2dd4bf)', display:'flex', alignItems:'center', justifyContent:'center', color:'#051424', fontWeight:800, fontSize:13, flexShrink:0 }}>
                    {s.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)', lineHeight:1.2 }}>{s.name}</p>
                    <p style={{ fontSize:11, color:'var(--text-faint)' }}>{s.rollNo || s.email}{s.department ? ` · ${s.department}` : ''}</p>
                    {s.skills?.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginTop:4 }}>
                        {s.skills.slice(0, 3).map((sk, i) => (
                          <span key={i} style={{ fontSize:9, padding:'1px 6px', borderRadius:4, background:'rgba(99,102,241,0.14)', color:'#bdc2ff', fontWeight:600 }}>{sk}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleSend(s._id)} disabled={sending === s._id}
                    style={{ padding:'7px 16px', borderRadius:10, fontSize:11, fontWeight:700, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#818cf8,#2dd4bf)', color:'#051424', transition:'all 0.15s', opacity: sending === s._id ? 0.6 : 1 }}>
                    {sending === s._id ? <Spinner size="sm"/> : 'Invite'}
                  </button>
                </div>
              ))}
              {!query && (
                <div style={{ padding:24, textAlign:'center' }}>
                  <p style={{ fontSize:32, marginBottom:8 }}>👤</p>
                  <p style={{ fontSize:13, color:'var(--text-muted)', fontWeight:600 }}>Start typing to search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sent invites */}
      {mode === 'sent' && isLead && (
        <div style={{ background:'var(--glass-bg)', border:'1.5px solid var(--glass-border)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', background:'linear-gradient(135deg, rgba(189,194,255,0.16), rgba(60,221,199,0.12))', borderBottom:'1px solid var(--glass-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontWeight:800, fontSize:13, color:'var(--text-primary)' }}>Sent Invitations</span>
            <span style={{ fontSize:11, padding:'2px 10px', borderRadius:999, background:'rgba(189,194,255,0.18)', color:'#d8dbff', fontWeight:700 }}>{sentInvites.length}</span>
          </div>
          {sentInvites.length === 0 ? (
            <div style={{ padding:40, textAlign:'center' }}>
              <p style={{ fontSize:32, marginBottom:8 }}>📨</p>
              <p style={{ fontSize:13, color:'var(--text-muted)', fontWeight:600 }}>No invites sent yet</p>
              <p style={{ fontSize:11, color:'var(--text-faint)' }}>Click "Invite Member" to add students to your team</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column' }}>
              {sentInvites.map(inv => (
                <div key={inv._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:'1px solid var(--border-subtle)', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#818cf8,#2dd4bf)', display:'flex', alignItems:'center', justifyContent:'center', color:'#051424', fontWeight:800, fontSize:12, flexShrink:0 }}>
                    {inv.receiver?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)' }}>{inv.receiver?.name || 'Student'}</p>
                    <p style={{ fontSize:11, color:'var(--text-faint)' }}>{inv.receiver?.rollNo || inv.receiver?.email} · {new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusPill status={inv.status}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Received invites */}
      {mode === 'received' && (
        <div style={{ background:'var(--glass-bg)', border:'1.5px solid var(--glass-border)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', background:'linear-gradient(135deg, rgba(189,194,255,0.16), rgba(60,221,199,0.12))', borderBottom:'1px solid var(--glass-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontWeight:800, fontSize:13, color:'var(--text-primary)' }}>Received Invitations</span>
            <span style={{ fontSize:11, padding:'2px 10px', borderRadius:999, background:'rgba(189,194,255,0.18)', color:'#d8dbff', fontWeight:700 }}>{myInvites.length}</span>
          </div>
          {myInvites.length === 0 ? (
            <div style={{ padding:40, textAlign:'center' }}>
              <p style={{ fontSize:32, marginBottom:8 }}>📬</p>
              <p style={{ fontSize:13, color:'var(--text-muted)', fontWeight:600 }}>No invitations received</p>
              <p style={{ fontSize:11, color:'var(--text-faint)' }}>When a team lead invites you, it will appear here</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column' }}>
              {myInvites.map(inv => (
                <div key={inv._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:'1px solid var(--border-subtle)', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:12, flexShrink:0 }}>
                    {inv.sender?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)' }}>
                      {inv.sender?.name} <span style={{ color:'var(--text-faint)', fontWeight:500 }}>invited you to</span> <span style={{ color:'#bdc2ff' }}>{inv.team?.name || 'Team'}</span>
                    </p>
                    <p style={{ fontSize:11, color:'var(--text-faint)' }}>{inv.project?.title} · {new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>
                  {inv.status === 'pending' ? (
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => handleAccept(inv._id)} style={{ padding:'6px 14px', borderRadius:8, fontSize:11, fontWeight:700, border:'none', cursor:'pointer', background:'rgba(34,197,94,0.18)', color:'#86efac', transition:'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.28)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.18)'; }}>
                        ✓ Accept
                      </button>
                      <button onClick={() => handleReject(inv._id)} style={{ padding:'6px 14px', borderRadius:8, fontSize:11, fontWeight:700, border:'none', cursor:'pointer', background:'rgba(239,68,68,0.14)', color:'#fca5a5', transition:'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.24)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; }}>
                        ✕ Decline
                      </button>
                    </div>
                  ) : (
                    <StatusPill status={inv.status}/>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
