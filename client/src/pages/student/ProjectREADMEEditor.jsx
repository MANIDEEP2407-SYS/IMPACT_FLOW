import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Spinner from '../../components/Spinner.jsx';

const TECH_TAGS = [
  'React','Next.js','Vue','Angular','Svelte',
  'Node.js','Express','FastAPI','Django','Flask','Spring Boot','Laravel',
  'MongoDB','PostgreSQL','MySQL','SQLite','Firebase','Redis',
  'Python','JavaScript','TypeScript','Java','Go','Rust','C++',
  'TensorFlow','PyTorch','scikit-learn','OpenCV',
  'Flutter','React Native','Android','iOS',
  'Docker','Kubernetes','AWS','GCP','Azure','Vercel','Railway',
  'REST API','GraphQL','WebSocket','gRPC',
  'JWT','OAuth','Bcrypt','Helmet',
];

const VALID_DOMAINS = [
  'AI/ML','Healthcare','Sustainability','Education','IoT',
  'Web Development','Cybersecurity','Finance','Logistics',
  'Agriculture','Social Impact','Entertainment','Other',
];

function WordCount({ text, min, label }) {
  const count = (text || '').trim().split(/\s+/).filter(Boolean).length;
  const ok = count >= min;
  return (
    <span className={`text-xs ml-1 ${ok ? 'text-green-400' : 'text-gray-500'}`}>
      {count}/{min} words {ok ? '✓' : ''}
    </span>
  );
}

function CompletionBar({ score }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-bold ${score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
        {score}%
      </span>
    </div>
  );
}

export default function ProjectREADMEEditor() {
  const { projectId } = useParams();
  const [form, setForm] = useState({
    problemStatement: '',
    projectDomain: '',
    techStack: [],
    coreFeatures: [{ title: '', description: '' }],
    systemWorkflow: '',
    uniqueDifferentiators: '',
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [score, setScore]       = useState(0);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get(`/projects/${projectId}/readme-meta`)
      .then(r => {
        const m = r.data.meta;
        if (m) {
          setForm({
            problemStatement:    m.problemStatement?.text || '',
            projectDomain:       m.projectDomain || '',
            techStack:           m.techStack || [],
            coreFeatures:        m.coreFeatures?.length ? m.coreFeatures : [{ title: '', description: '' }],
            systemWorkflow:      m.systemWorkflow?.text || '',
            uniqueDifferentiators: m.uniqueDifferentiators?.text || '',
          });
          setScore(m.completionScore || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  function toggleTag(tag) {
    setForm(f => ({
      ...f,
      techStack: f.techStack.includes(tag)
        ? f.techStack.filter(t => t !== tag)
        : [...f.techStack, tag],
    }));
  }

  function addFeature() {
    setForm(f => ({ ...f, coreFeatures: [...f.coreFeatures, { title: '', description: '' }] }));
  }

  function removeFeature(idx) {
    setForm(f => ({ ...f, coreFeatures: f.coreFeatures.filter((_, i) => i !== idx) }));
  }

  function updateFeature(idx, field, val) {
    setForm(f => ({
      ...f,
      coreFeatures: f.coreFeatures.map((feat, i) => i === idx ? { ...feat, [field]: val } : feat),
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess(''); setWarnings([]);
    try {
      const r = await api.post(`/projects/${projectId}/readme-meta`, {
        ...form,
        coreFeatures: form.coreFeatures.filter(f => f.title.trim()),
      });
      setScore(r.data.completionScore);
      setWarnings(r.data.warnings || []);
      setSuccess('README metadata saved successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Project README Metadata</h1>
        <p className="text-sm text-gray-400 mt-1">
          This structured metadata is used for plagiarism analysis and project discovery.
          Be specific — vague answers reduce your project's credibility.
        </p>
      </div>

      {/* Completion score */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">README Completion</span>
          {score >= 80 && <span className="text-xs text-green-400 bg-green-900/40 px-2 py-0.5 rounded-full">Complete ✓</span>}
        </div>
        <CompletionBar score={score} />
        {score < 80 && <p className="text-xs text-gray-500 mt-1">Reach 80% to mark as complete. Target: 150-word problem statement, 5+ features, 100-word workflow & differentiators.</p>}
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Problem Statement */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label">Problem Statement <span className="text-red-400">*</span></label>
            <WordCount text={form.problemStatement} min={150} />
          </div>
          <textarea
            className="input min-h-[120px] resize-y"
            placeholder="Describe the exact problem your project solves. Who are the target users? Why does this problem matter? What existing solutions fail at? Be detailed and specific — minimum 150 words."
            value={form.problemStatement}
            onChange={e => setForm(f => ({ ...f, problemStatement: e.target.value }))}
            required
          />
          <p className="text-xs text-gray-500 mt-1">This is the highest-weight factor in similarity analysis (30%). Be genuinely unique.</p>
        </div>

        {/* Domain */}
        <div>
          <label className="label">Project Domain <span className="text-red-400">*</span></label>
          <select
            className="input"
            value={form.projectDomain}
            onChange={e => setForm(f => ({ ...f, projectDomain: e.target.value }))}
            required
          >
            <option value="">Select domain...</option>
            {VALID_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Tech Stack */}
        <div>
          <label className="label">Tech Stack</label>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {TECH_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  form.techStack.includes(tag)
                    ? 'bg-indigo-700 border-indigo-600 text-white'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Selected: {form.techStack.length} · Tech stack has lowest weight (10%) — sharing a stack is not suspicious.
          </p>
        </div>

        {/* Core Features */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label">Core Features <span className="text-red-400">*</span></label>
            <span className={`text-xs ${form.coreFeatures.filter(f=>f.title).length >= 5 ? 'text-green-400' : 'text-gray-500'}`}>
              {form.coreFeatures.filter(f=>f.title).length}/5 minimum
            </span>
          </div>
          <div className="space-y-2">
            {form.coreFeatures.map((feat, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <input
                    className="input py-2 text-sm"
                    placeholder={`Feature ${idx + 1} title (e.g. AI milestone evaluator)`}
                    value={feat.title}
                    onChange={e => updateFeature(idx, 'title', e.target.value)}
                  />
                  <input
                    className="input py-2 text-xs text-gray-400"
                    placeholder="Brief description (optional)"
                    value={feat.description || ''}
                    onChange={e => updateFeature(idx, 'description', e.target.value)}
                  />
                </div>
                {form.coreFeatures.length > 1 && (
                  <button type="button" onClick={() => removeFeature(idx)}
                    className="mt-2 text-gray-600 hover:text-red-400 transition-colors text-xs">✕</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addFeature}
            className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            + Add feature
          </button>
          <p className="text-xs text-gray-500 mt-1">
            Feature overlap is a strong similarity signal (25%). Name features precisely — avoid generic terms like "login" or "dashboard".
          </p>
        </div>

        {/* System Workflow */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label">System Workflow <span className="text-red-400">*</span></label>
            <WordCount text={form.systemWorkflow} min={100} />
          </div>
          <textarea
            className="input min-h-[100px] resize-y"
            placeholder="Explain how your system works end-to-end. What is the architecture? How do users interact? What is the data flow? What makes your workflow different from similar apps?"
            value={form.systemWorkflow}
            onChange={e => setForm(f => ({ ...f, systemWorkflow: e.target.value }))}
            required
          />
        </div>

        {/* Unique Differentiators */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label">Unique Differentiators <span className="text-red-400">*</span></label>
            <WordCount text={form.uniqueDifferentiators} min={100} />
          </div>
          <textarea
            className="input min-h-[100px] resize-y"
            placeholder="What makes your project genuinely unique? Describe architectural uniqueness, novel workflows, or specific academic contributions. AVOID vague phrases like 'user-friendly' or 'modern UI' — these are rejected."
            value={form.uniqueDifferentiators}
            onChange={e => setForm(f => ({ ...f, uniqueDifferentiators: e.target.value }))}
            required
          />
          <div className="mt-1 space-y-0.5">
            <p className="text-xs text-red-400">✗ Invalid: "user-friendly", "modern UI", "easy to use", "innovative"</p>
            <p className="text-xs text-green-400">✓ Valid: Specific workflows, algorithms, integrations, detection mechanisms</p>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-yellow-400">⚠ Suggestions to improve your README:</p>
            {warnings.map((w, i) => <p key={i} className="text-xs text-yellow-300">• {w}</p>)}
          </div>
        )}

        {error   && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          {saving && <Spinner size="sm" />}
          Save README Metadata
        </button>
      </form>
    </div>
  );
}
