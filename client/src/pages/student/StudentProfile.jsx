import { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';

function splitTags(value) {
  return value
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
}

function asCsv(items = []) {
  return items.join(', ');
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--glass-bg, var(--bg-panel))', border: '1px solid var(--glass-border, var(--border-glass))' }}>
      <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [detailed, setDetailed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    bio: '',
    skillsCsv: '',
    domainsCsv: '',
    techStackCsv: '',
    github: '',
    linkedin: '',
    timezone: 'UTC',
  });

  async function loadProfile() {
    const { data: profileData } = await api.get('/user/profile');
    setProfile(profileData.user);

    const { data: detailedData } = await api.get(`/users/${profileData.user._id}/profile`);
    setDetailed(detailedData.profile);

    setFormData({
      bio: profileData.user.bio || '',
      skillsCsv: asCsv(profileData.user.skills),
      domainsCsv: asCsv(profileData.user.domains),
      techStackCsv: asCsv(profileData.user.techStack),
      github: profileData.user.github || '',
      linkedin: profileData.user.linkedin || '',
      timezone: profileData.user.timezone || 'UTC',
    });
  }

  useEffect(() => {
    loadProfile()
      .catch(err => setError(err.response?.data?.error || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const initials = useMemo(() => (
    profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  ), [profile]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/user/profile', {
        bio: formData.bio,
        skills: splitTags(formData.skillsCsv),
        domains: splitTags(formData.domainsCsv),
        techStack: splitTags(formData.techStackCsv),
        github: formData.github,
        linkedin: formData.linkedin,
        timezone: formData.timezone,
      });
      await loadProfile();
      setEditing(false);
      setSuccess('Profile updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full page-enter">
          <div className="rounded-2xl p-6 mb-6" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #eef2ff 45%, #ecfeff 100%)', border: '1px solid rgba(99,102,241,0.14)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center font-black text-xl"
                  style={{ background: 'linear-gradient(135deg, var(--neon-500), var(--cyber-600))', color: 'white' }}>
                  {initials}
                </div>
                <div>
                  <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{detailed?.academic?.name || profile?.name}</h1>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {detailed?.academic?.department || profile?.department} · Sem {detailed?.academic?.semester || profile?.semester}
                  </p>
                  <p className="text-xs font-semibold mt-1" style={{ color: '#8b5cf6' }}>
                    Reputation: {detailed?.reputation?.badge || 'Emerging Contributor'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditing(prev => !prev);
                  setSuccess('');
                  setError('');
                }}
                className="px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: editing ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: editing ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(34,197,94,0.35)', color: editing ? '#f87171' : '#86efac' }}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {!!error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              {error}
            </div>
          )}
          {!!success && (
            <div className="mb-4 p-3 rounded-lg text-sm font-semibold" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac' }}>
              {success}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <StatCard label="Projects Participated" value={detailed?.stats?.projectsParticipated ?? 0} />
            <StatCard label="Tasks Completed" value={detailed?.stats?.tasksCompleted ?? 0} />
            <StatCard label="Contribution Average" value={detailed?.stats?.contributionAverage ?? 0} />
            <StatCard label="Milestones Submitted" value={detailed?.stats?.milestonesSubmitted ?? 0} />
            <StatCard label="Files Uploaded" value={detailed?.stats?.filesUploaded ?? 0} />
            <StatCard label="Current Reputation" value={detailed?.reputation?.badge || 'Emerging Contributor'} />
          </div>

          <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--glass-bg, var(--bg-panel))', border: '1px solid var(--glass-border, var(--border-glass))' }}>
            <h2 className="text-sm font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Academic</h2>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <p><strong>Name:</strong> {detailed?.academic?.name || profile?.name}</p>
              <p><strong>Roll Number:</strong> {detailed?.academic?.rollNo || profile?.rollNo || '-'}</p>
              <p><strong>Department:</strong> {detailed?.academic?.department || profile?.department || '-'}</p>
              <p><strong>Semester:</strong> {detailed?.academic?.semester || profile?.semester || '-'}</p>
            </div>
          </div>

          <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--glass-bg, var(--bg-panel))', border: '1px solid var(--glass-border, var(--border-glass))' }}>
            <h2 className="text-sm font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Technical</h2>
            <div className="space-y-3">
              <textarea
                name="bio"
                value={editing ? formData.bio : (detailed?.technical?.bio || '')}
                onChange={handleChange}
                disabled={!editing}
                rows={3}
                className="w-full p-3 rounded-lg text-sm"
                style={{ background: editing ? 'var(--bg-input, #1e2a3f)' : 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                placeholder="Short bio"
              />
              <input name="skillsCsv" value={editing ? formData.skillsCsv : asCsv(detailed?.technical?.skills)} onChange={handleChange} disabled={!editing}
                className="w-full p-3 rounded-lg text-sm" style={{ background: editing ? 'var(--bg-input, #1e2a3f)' : 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                placeholder="Skills (comma separated)" />
              <input name="domainsCsv" value={editing ? formData.domainsCsv : asCsv(detailed?.technical?.domains)} onChange={handleChange} disabled={!editing}
                className="w-full p-3 rounded-lg text-sm" style={{ background: editing ? 'var(--bg-input, #1e2a3f)' : 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                placeholder="Domains (comma separated)" />
              <input name="techStackCsv" value={editing ? formData.techStackCsv : asCsv(detailed?.technical?.techStack)} onChange={handleChange} disabled={!editing}
                className="w-full p-3 rounded-lg text-sm" style={{ background: editing ? 'var(--bg-input, #1e2a3f)' : 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                placeholder="Tech stack (comma separated)" />
              <div className="grid md:grid-cols-2 gap-3">
                <input name="github" value={editing ? formData.github : (detailed?.technical?.github || '')} onChange={handleChange} disabled={!editing}
                  className="w-full p-3 rounded-lg text-sm" style={{ background: editing ? 'var(--bg-input, #1e2a3f)' : 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                  placeholder="GitHub URL" />
                <input name="linkedin" value={editing ? formData.linkedin : (detailed?.technical?.linkedin || '')} onChange={handleChange} disabled={!editing}
                  className="w-full p-3 rounded-lg text-sm" style={{ background: editing ? 'var(--bg-input, #1e2a3f)' : 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                  placeholder="LinkedIn URL" />
              </div>
              <input name="timezone" value={editing ? formData.timezone : (profile?.timezone || 'UTC')} onChange={handleChange} disabled={!editing}
                className="w-full p-3 rounded-lg text-sm" style={{ background: editing ? 'var(--bg-input, #1e2a3f)' : 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                placeholder="Timezone" />
            </div>
            {editing && (
              <div className="mt-4">
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-bold"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)', color: '#86efac', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl p-5" style={{ background: 'var(--glass-bg, var(--bg-panel))', border: '1px solid var(--glass-border, var(--border-glass))' }}>
            <h2 className="text-sm font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Team History</h2>
            {!detailed?.teamHistory?.length ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No team history available.</p>
            ) : (
              <div className="space-y-2">
                {detailed.teamHistory.map(team => (
                  <div key={team.teamId} className="rounded p-3 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)' }}>
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{team.teamName} · {team.role}</p>
                    <p style={{ color: 'var(--text-muted)' }}>
                      {team.project?.title || 'Project'} · {team.course?.name || 'Course'} · {team.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
