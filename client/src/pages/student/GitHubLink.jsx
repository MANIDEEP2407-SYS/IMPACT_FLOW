import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Spinner from '../../components/Spinner.jsx';

export default function GitHubLink() {
  const { projectId } = useParams();
  const [link, setLink]         = useState(null);
  const [form, setForm]         = useState({ githubUsername: '', repoUrl: '' });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [syncing, setSyncing]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    api.get(`/projects/${projectId}/github-link`)
      .then(r => { setLink(r.data.link); if (r.data.link) setForm({ githubUsername: r.data.link.githubUsername, repoUrl: r.data.link.repoUrl }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const r = await api.post(`/projects/${projectId}/github-link`, form);
      setLink(r.data.link);
      setSuccess('GitHub account linked successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to link GitHub');
    } finally { setSaving(false); }
  }

  async function handleSync() {
    setSyncing(true); setError(''); setSyncResult(null);
    try {
      const r = await api.post(`/projects/${projectId}/github-sync`);
      setSyncResult(r.data.results);
      setSuccess(`Synced! ${r.data.results.commits} commits and ${r.data.results.prs} PRs recorded.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Sync failed');
    } finally { setSyncing(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">GitHub Integration</h1>
        <p className="text-sm text-gray-400 mt-1">
          Link your GitHub account to automatically track commits and pull requests as contribution evidence.
        </p>
      </div>

      {/* Why GitHub */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Why link GitHub?</p>
        <ul className="space-y-1">
          {[
            ['💻', 'Commits are timestamped & verifiable — difficult to fake'],
            ['🔀', 'Merged PRs score highest (15 pts × quality)'],
            ['📊', 'Activity appears in your contribution timeline'],
            ['✅', 'Only your commits on the registered repo count'],
          ].map(([icon, text]) => (
            <li key={text} className="text-xs text-gray-300 flex gap-2">
              <span>{icon}</span> {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Current status */}
      {link && (
        <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm font-semibold text-green-300">Linked</span>
          </div>
          <p className="text-xs text-gray-300">
            <strong>{link.githubUsername}</strong> → <a href={link.repoUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">{link.repoUrl}</a>
          </p>
          {link.lastSyncedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Last synced: {new Date(link.lastSyncedAt).toLocaleString()}
            </p>
          )}
          {link.syncError && (
            <p className="text-xs text-yellow-400 mt-1">⚠ Last sync error: {link.syncError}</p>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4 mb-4">
        <div>
          <label className="label">GitHub Username</label>
          <input
            className="input"
            placeholder="e.g. manideep2407"
            value={form.githubUsername}
            onChange={e => setForm(f => ({ ...f, githubUsername: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Repository URL (must be public)</label>
          <input
            className="input"
            placeholder="https://github.com/username/repo-name"
            value={form.repoUrl}
            onChange={e => setForm(f => ({ ...f, repoUrl: e.target.value }))}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Only public repos are supported. Private repos cannot be verified.
          </p>
        </div>

        {error   && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && <Spinner size="sm" />}
            {link ? 'Update Link' : 'Link GitHub'}
          </button>
          {link && (
            <button type="button" onClick={handleSync} disabled={syncing}
              className="btn-secondary flex items-center gap-2">
              {syncing && <Spinner size="sm" />}
              {syncing ? 'Syncing...' : '↻ Sync Now'}
            </button>
          )}
        </div>
      </form>

      {/* Sync result */}
      {syncResult && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-sm">
          <p className="font-semibold text-white mb-2">Sync Results</p>
          <p className="text-gray-300">✅ <strong>{syncResult.commits}</strong> new commits recorded</p>
          <p className="text-gray-300">✅ <strong>{syncResult.prs}</strong> pull requests recorded</p>
          {syncResult.errors?.length > 0 && (
            <p className="text-yellow-400 mt-1 text-xs">⚠ {syncResult.errors.join('; ')}</p>
          )}
        </div>
      )}

      {/* What won't count */}
      <div className="mt-6 bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">What does NOT count</p>
        <ul className="space-y-0.5">
          {[
            'Merge commits ("Merge branch main")',
            'Empty commits with no meaningful message',
            'Duplicate commits (same SHA)',
            'Commits to unregistered repos',
            'Lines of code — never measured',
          ].map(item => (
            <li key={item} className="text-xs text-gray-500 flex gap-2">
              <span className="text-red-500">✗</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
