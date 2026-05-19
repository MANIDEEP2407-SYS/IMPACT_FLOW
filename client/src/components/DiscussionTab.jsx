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

/* ── Time ago helper ── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/* ═════════════════════ THREAD CARD ═════════════════════ */
function ThreadCard({ discussion, userId, isLead, isFaculty, onReply, onPin, onDelete }) {
  const [expanded, setExpanded]   = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending]     = useState(false);

  const canPin = isLead || isFaculty;
  const canDelete = String(discussion.author?._id) === String(userId) || isLead || isFaculty;

  async function handleReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    await onReply(discussion._id, replyText);
    setReplyText('');
    setSending(false);
  }

  return (
    <div style={{
      borderRadius:16, overflow:'hidden', transition:'all 0.2s',
      background: discussion.pinned ? 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(245,158,11,0.02))' : 'var(--glass-bg)',
      border: `1.5px solid ${discussion.pinned ? 'rgba(245,158,11,0.25)' : 'var(--glass-border)'}`,
      boxShadow: discussion.pinned ? '0 4px 20px rgba(245,158,11,0.1)' : 'none',
    }}>
      {/* Thread header */}
      <div style={{ padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer' }}
        onClick={() => setExpanded(!expanded)}>
        {/* Avatar */}
        <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#818cf8,#2dd4bf)', display:'flex', alignItems:'center', justifyContent:'center', color:'#051424', fontWeight:800, fontSize:13, flexShrink:0 }}>
          {discussion.author?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            {discussion.pinned && (
              <span style={{ fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:4, background:'rgba(245,158,11,0.16)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>📌 Pinned</span>
            )}
            <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', margin:0 }}>{discussion.title}</h3>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:3, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)' }}>{discussion.author?.name}</span>
            <span style={{ fontSize:11, color:'var(--text-faint)' }}>·</span>
            <span style={{ fontSize:11, color:'var(--text-faint)' }}>{timeAgo(discussion.createdAt)}</span>
            <span style={{ fontSize:11, color:'var(--text-faint)' }}>·</span>
            <span style={{ fontSize:11, color:'#bdc2ff', fontWeight:600 }}>{discussion.replies?.length || 0} replies</span>
          </div>
        </div>
        {/* Expand icon */}
        <span style={{ color:'#62fae3', fontSize:14, transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.2s', marginTop:4 }}>▼</span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop:'1px solid var(--border-subtle)' }}>
          {/* Thread body */}
          <div style={{ padding:'14px 18px', paddingLeft:64 }}>
            <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{discussion.content}</p>

            {/* Actions */}
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              {canPin && (
                <button onClick={(e) => { e.stopPropagation(); onPin(discussion._id); }}
                  style={{ padding:'4px 10px', borderRadius:6, fontSize:10, fontWeight:700, border:'1px solid rgba(245,158,11,0.3)', background:'rgba(245,158,11,0.1)', color:'#fbbf24', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; }}>
                  {discussion.pinned ? '📌 Unpin' : '📌 Pin'}
                </button>
              )}
              {canDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(discussion._id); }}
                  style={{ padding:'4px 10px', borderRadius:6, fontSize:10, fontWeight:700, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.1)', color:'#fca5a5', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}>
                  🗑 Delete
                </button>
              )}
            </div>
          </div>

          {/* Replies */}
          {discussion.replies?.length > 0 && (
            <div style={{ borderTop:'1px solid var(--border-subtle)', background:'rgba(5,16,31,0.4)' }}>
              {discussion.replies.map((reply, i) => (
                <div key={reply._id || i} style={{ display:'flex', gap:10, padding:'12px 18px 12px 64px', borderBottom: i < discussion.replies.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:10, flexShrink:0 }}>
                    {reply.author?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>{reply.author?.name}</span>
                      <span style={{ fontSize:10, color:'var(--text-faint)' }}>{timeAgo(reply.createdAt)}</span>
                    </div>
                    <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.6, marginTop:3, whiteSpace:'pre-wrap' }}>{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          <form onSubmit={handleReply} style={{ display:'flex', gap:8, padding:'12px 18px 14px 64px', borderTop:'1px solid var(--border-subtle)', background:'rgba(5,16,31,0.3)' }}>
            <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply…"
              style={{ flex:1, padding:'9px 14px', borderRadius:10, border:'1.5px solid var(--glass-border)', fontSize:12, outline:'none', color:'var(--text-secondary)', background:'rgba(5,16,31,0.72)', fontWeight:500 }}/>
            <button type="submit" disabled={sending || !replyText.trim()}
              style={{ padding:'9px 18px', borderRadius:10, fontSize:11, fontWeight:700, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#818cf8,#2dd4bf)', color:'#051424', opacity: (sending || !replyText.trim()) ? 0.5 : 1, transition:'all 0.15s' }}>
              {sending ? <Spinner size="sm"/> : 'Reply'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════ MAIN COMPONENT ════════════════════════════ */
export default function DiscussionTab({ teamId, team, userId }) {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);
  const [showNew, setShowNew]         = useState(false);
  const [newTitle, setNewTitle]       = useState('');
  const [newContent, setNewContent]   = useState('');
  const [creating, setCreating]       = useState(false);
  const formRef = useRef(null);

  const isLead = String(team?.teamLead?._id || team?.teamLead) === String(userId);
  const isFaculty = false; // This is determined by the user role, passed from parent

  useEffect(() => {
    api.get(`/teams/${teamId}/discussions`)
      .then(r => { setDiscussions(r.data.discussions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [teamId]);

  /* Create discussion */
  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post(`/teams/${teamId}/discussions`, { title: newTitle, content: newContent });
      setDiscussions(d => [data.discussion, ...d]);
      setNewTitle(''); setNewContent(''); setShowNew(false);
      setToast({ msg: 'Discussion created!', type: 'success' });
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Failed to create', type: 'error' });
    }
    setCreating(false);
  }

  /* Reply to discussion */
  async function handleReply(discussionId, content) {
    try {
      const { data } = await api.post(`/discussions/${discussionId}/replies`, { content });
      setDiscussions(d => d.map(disc => disc._id === discussionId ? data.discussion : disc));
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Failed to reply', type: 'error' });
    }
  }

  /* Toggle pin */
  async function handlePin(discussionId) {
    try {
      const { data } = await api.put(`/discussions/${discussionId}/pin`);
      setDiscussions(d => d.map(disc => disc._id === discussionId ? { ...disc, pinned: data.discussion.pinned } : disc)
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt)));
      setToast({ msg: data.discussion.pinned ? 'Discussion pinned!' : 'Discussion unpinned', type: 'success' });
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Failed to toggle pin', type: 'error' });
    }
  }

  /* Delete */
  async function handleDelete(discussionId) {
    if (!confirm('Delete this discussion? This cannot be undone.')) return;
    try {
      await api.delete(`/discussions/${discussionId}`);
      setDiscussions(d => d.filter(disc => disc._id !== discussionId));
      setToast({ msg: 'Discussion deleted', type: 'success' });
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Failed to delete', type: 'error' });
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg"/></div>;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}

      {/* Header + New button */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontSize:15, fontWeight:800, color:'var(--text-primary)', margin:0 }}>Team Discussions</h2>
          <p style={{ fontSize:11, color:'var(--text-faint)', margin:0, marginTop:2 }}>{discussions.length} threads · Collaborate with your team</p>
        </div>
        <button onClick={() => setShowNew(!showNew)}
          style={{ padding:'10px 20px', borderRadius:12, fontSize:13, fontWeight:700, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#818cf8,#2dd4bf)', color:'#051424', boxShadow:'0 4px 16px rgba(99,102,241,0.25)', transition:'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
          {showNew ? '✕ Cancel' : '+ New Thread'}
        </button>
      </div>

      {/* New thread form */}
      {showNew && (
        <form ref={formRef} onSubmit={handleCreate} style={{ background:'var(--glass-bg)', border:'1.5px solid rgba(129,140,248,0.3)', borderRadius:16, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
          <div style={{ padding:'14px 18px', background:'linear-gradient(135deg, rgba(189,194,255,0.12), rgba(60,221,199,0.08))', borderBottom:'1px solid var(--glass-border)' }}>
            <span style={{ fontWeight:800, fontSize:13, color:'var(--text-primary)' }}>Create New Discussion</span>
          </div>
          <div style={{ padding:18, display:'flex', flexDirection:'column', gap:12 }}>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Thread title…" autoFocus
              style={{ padding:'12px 14px', borderRadius:10, border:'1.5px solid var(--glass-border)', background:'rgba(5,16,31,0.72)', color:'var(--text-secondary)', fontSize:14, outline:'none', fontWeight:600 }}/>
            <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="What's on your mind? Share ideas, questions, or updates…"
              style={{ width:'100%', minHeight:120, padding:'12px 14px', borderRadius:10, border:'1.5px solid var(--glass-border)', background:'rgba(5,16,31,0.72)', color:'var(--text-secondary)', fontSize:13, outline:'none', resize:'vertical', lineHeight:1.7, fontFamily:'inherit' }}/>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button type="button" onClick={() => setShowNew(false)} style={{ padding:'10px 20px', borderRadius:10, fontSize:12, fontWeight:700, border:'1px solid var(--glass-border)', background:'transparent', color:'var(--text-muted)', cursor:'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={creating || !newTitle.trim() || !newContent.trim()}
                style={{ padding:'10px 24px', borderRadius:10, fontSize:12, fontWeight:700, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#818cf8,#2dd4bf)', color:'#051424', opacity: (creating || !newTitle.trim() || !newContent.trim()) ? 0.5 : 1 }}>
                {creating ? <><Spinner size="sm"/> Creating…</> : 'Post Discussion'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Threads */}
      {discussions.length === 0 && !showNew ? (
        <div style={{ background:'var(--glass-bg)', border:'1.5px dashed var(--glass-border)', borderRadius:16, padding:48, textAlign:'center' }}>
          <p style={{ fontSize:36, marginBottom:8 }}>💬</p>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--text-muted)', marginBottom:4 }}>No discussions yet</p>
          <p style={{ fontSize:12, color:'var(--text-faint)' }}>Start a thread to discuss ideas, ask questions, or share updates with your team.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {discussions.map(d => (
            <ThreadCard key={d._id} discussion={d} userId={userId} isLead={isLead} isFaculty={isFaculty}
              onReply={handleReply} onPin={handlePin} onDelete={handleDelete}/>
          ))}
        </div>
      )}
    </div>
  );
}
