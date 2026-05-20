import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Spinner from '../../components/Spinner.jsx';

const LEVEL_STYLES = {
  critical:    { bg: 'bg-red-900/40 border-red-700',    badge: 'bg-red-800 text-red-200',    bar: 'bg-red-500' },
  high:        { bg: 'bg-orange-900/30 border-orange-700', badge: 'bg-orange-800 text-orange-200', bar: 'bg-orange-500' },
  significant: { bg: 'bg-yellow-900/20 border-yellow-800', badge: 'bg-yellow-800 text-yellow-200', bar: 'bg-yellow-500' },
  mild:        { bg: 'bg-blue-900/20 border-blue-800',  badge: 'bg-blue-800 text-blue-200',  bar: 'bg-blue-400' },
  normal:      { bg: 'bg-gray-800/30 border-gray-700',  badge: 'bg-gray-700 text-gray-300',  bar: 'bg-gray-500' },
};

const FACTOR_LABELS = {
  problemStatement: 'Problem Statement',
  features:         'Core Features',
  workflow:         'System Workflow',
  differentiators:  'Differentiators',
  techStack:        'Tech Stack',
};

const FACTOR_WEIGHTS = {
  problemStatement: 30,
  features:         25,
  workflow:         20,
  differentiators:  15,
  techStack:        10,
};

function ScoreBar({ value, barClass }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${barClass}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-300 w-8 text-right">{value}%</span>
    </div>
  );
}

export default function SimilarityReport() {
  const { courseId } = useParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [filter, setFilter] = useState('all'); // all | critical | high | significant
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get(`/courses/${courseId}/similarity`)
      .then(r => setData(r.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load similarity data'))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (error) return <div className="text-center py-20 text-red-400">{error}</div>;
  if (!data)  return null;

  const FILTER_LEVELS = { all: null, critical: ['critical'], high: ['critical', 'high'], significant: ['critical', 'high', 'significant'] };
  const visiblePairs = filter === 'all'
    ? data.pairs
    : data.pairs.filter(p => FILTER_LEVELS[filter]?.includes(p.level.level));

  const criticalCount    = data.pairs.filter(p => p.level.level === 'critical').length;
  const highCount        = data.pairs.filter(p => p.level.level === 'high').length;
  const significantCount = data.pairs.filter(p => p.level.level === 'significant').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Project Similarity Report</h1>
        <p className="text-sm text-gray-400 mt-1">
          Weighted multi-factor analysis across {data.totalProjects} projects ({data.analyzedProjects} with README metadata).
          Faculty review only — never auto-penalises students.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Projects', value: data.totalProjects, color: 'text-white' },
          { label: 'With README Meta', value: data.analyzedProjects, color: 'text-blue-400' },
          { label: 'Flagged Pairs', value: criticalCount + highCount, color: 'text-orange-400' },
          { label: 'Possible Duplicates', value: criticalCount, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weight matrix legend */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-3 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Analysis Weight Matrix</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(FACTOR_WEIGHTS).map(([k, w]) => (
            <span key={k} className="text-xs text-gray-300">
              {FACTOR_LABELS[k]}: <strong className="text-white">{w}%</strong>
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          ⚠ Tech stack intentionally weighted lowest — sharing React/Node is not suspicious.
          Problem statements and features are highest signal.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'all',         label: `All (${data.pairs.length})` },
          { key: 'critical',    label: `🔴 Possible Dup (${criticalCount})` },
          { key: 'high',        label: `🟠 High (${highCount})` },
          { key: 'significant', label: `🟡 Significant (${significantCount})` },
        ].map(tab => (
          <button key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filter === tab.key
                      ? 'bg-indigo-700 border-indigo-600 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* No results */}
      {!visiblePairs.length && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-medium text-gray-300">No {filter !== 'all' ? filter + ' ' : ''}similarity pairs found</p>
          <p className="text-sm mt-1">
            {data.analyzedProjects < data.totalProjects
              ? `${data.totalProjects - data.analyzedProjects} projects haven't submitted README metadata yet.`
              : 'All projects show acceptable differentiation.'}
          </p>
        </div>
      )}

      {/* Pair cards */}
      <div className="space-y-3">
        {visiblePairs.map((pair, idx) => {
          const style = LEVEL_STYLES[pair.level.level] || LEVEL_STYLES.normal;
          const isOpen = expanded === idx;

          return (
            <div key={idx} className={`border rounded-xl overflow-hidden ${style.bg}`}>
              {/* Summary row */}
              <button
                className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(isOpen ? null : idx)}
              >
                {/* Level badge */}
                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                  {pair.level.label}
                </span>

                {/* Projects */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {pair.projectA.title} <span className="text-gray-500 mx-1">vs</span> {pair.projectB.title}
                  </p>
                  {pair.projectA.domain && (
                    <p className="text-xs text-gray-500">
                      {pair.projectA.domain} · {pair.projectB.domain}
                    </p>
                  )}
                </div>

                {/* Overall score */}
                <div className="shrink-0 text-right">
                  <p className="text-xl font-bold text-white">{pair.scores.overall}%</p>
                  <p className="text-xs text-gray-500">overall</p>
                </div>

                <span className="text-gray-500 text-xs">{isOpen ? '▲' : '▼'}</span>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-700/50 pt-3 space-y-4">
                  {/* Per-factor breakdown */}
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(FACTOR_LABELS).map(([key, label]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-gray-400">{label}</span>
                          <span className="text-xs text-gray-500">weight: {FACTOR_WEIGHTS[key]}%</span>
                        </div>
                        <ScoreBar value={pair.scores[key] || 0} barClass={style.bar} />
                      </div>
                    ))}
                  </div>

                  {/* Evidence */}
                  {pair.evidence.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Evidence</p>
                      <ul className="space-y-1">
                        {pair.evidence.map((e, i) => (
                          <li key={i} className="text-xs text-gray-300 flex gap-2">
                            <span className="text-yellow-400">⚠</span> {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Overlapping features */}
                  {pair.overlappingFeatures.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Overlapping Features</p>
                      <div className="space-y-1">
                        {pair.overlappingFeatures.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-blue-300 bg-blue-900/40 px-2 py-0.5 rounded">{f.a}</span>
                            <span className="text-gray-500">≈</span>
                            <span className="text-blue-300 bg-blue-900/40 px-2 py-0.5 rounded">{f.b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important note */}
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-xs text-gray-400">
                    <strong className="text-white">Important:</strong> This is a similarity indicator, not a plagiarism verdict.
                    Review both projects manually before drawing conclusions. Shared domain and stack do not indicate copying.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
