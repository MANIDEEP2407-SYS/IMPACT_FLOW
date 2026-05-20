import { useState, useEffect } from 'react';
import api from '../utils/api.js';

const VALUE_TIERS = [
  { label: 'High Value', min: 10, color: 'text-green-400 bg-green-900/40 border-green-800' },
  { label: 'Medium Value', min: 4, color: 'text-blue-400 bg-blue-900/40 border-blue-800' },
  { label: 'Low Value', min: 0, color: 'text-gray-400 bg-gray-800/60 border-gray-700' },
];

const EVENT_LABELS = {
  DISCUSSION_REPLY:     'Reply to Discussion',
  DISCUSSION_POSTED:    'Start a Discussion',
  README_EDIT_MINOR:    'Minor README Edit',
  TASK_CREATED:         'Create a Task',
  FILE_UPLOAD:          'Upload a File',
  README_EDIT_MAJOR:    'Major README Edit',
  TASK_COMPLETED:       'Complete a Task',
  TASK_REVIEWED:        'Review a Task',
  DOCUMENTATION_UPLOAD: 'Upload Documentation',
  MILESTONE_SUBMITTED:  'Submit a Milestone',
  MILESTONE_REVISED:    'Revise Milestone Submission',
  GITHUB_PR_OPENED:     'Open a Pull Request',
  GITHUB_PR_MERGED:     'Merge a Pull Request',
  GITHUB_COMMIT:        'Push a Feature Commit',
  GITHUB_ISSUE_COMMENT: 'Comment on GitHub Issue',
};

function getTier(score) {
  if (score >= 10) return VALUE_TIERS[0];
  if (score >= 4)  return VALUE_TIERS[1];
  return VALUE_TIERS[2];
}

export default function WeightMatrix({ compact = false }) {
  const [matrix, setMatrix] = useState(null);
  const [open, setOpen]     = useState(!compact);

  useEffect(() => {
    api.get('/contributions/weights')
      .then(r => setMatrix(r.data))
      .catch(() => {});
  }, []);

  if (!matrix) return null;

  const entries = Object.entries(matrix.weights).sort(([, a], [, b]) => b - a);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">📊 Scoring Rules</span>
          <span className="text-xs text-gray-400">— transparent & deterministic</span>
        </div>
        <span className="text-gray-500 text-xs">{open ? '▲ hide' : '▼ show'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Formula */}
          <div className="bg-gray-800/60 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 border border-indigo-900/50">
            {matrix.formula}
          </div>

          {/* Event scores grouped by tier */}
          {VALUE_TIERS.map(tier => {
            const tierEntries = entries.filter(([, s]) =>
              s >= tier.min && (tier.min === 10 ? true : s < VALUE_TIERS[VALUE_TIERS.indexOf(tier) - 1]?.min ?? Infinity)
            );
            if (!tierEntries.length) return null;
            return (
              <div key={tier.label}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{tier.label}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {tierEntries.map(([event, score]) => (
                    <div key={event}
                         className={`flex items-center justify-between px-2.5 py-1.5 rounded border text-xs ${tier.color}`}>
                      <span>{EVENT_LABELS[event] || event}</span>
                      <span className="font-bold ml-2">{score} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Multipliers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quality Multiplier</p>
              {Object.entries(matrix.qualityMultipliers).map(([q, m]) => (
                <div key={q} className="flex justify-between text-xs py-0.5">
                  <span className="capitalize text-gray-300">{q}</span>
                  <span className="font-mono text-yellow-400">×{m}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Validation Multiplier</p>
              {Object.entries(matrix.validationMultipliers).map(([v, m]) => (
                <div key={v} className="flex justify-between text-xs py-0.5">
                  <span className="capitalize text-gray-300">{v}</span>
                  <span className={`font-mono ${m === 0 ? 'text-red-400' : m < 1 ? 'text-yellow-400' : 'text-green-400'}`}>×{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Anti-spam */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Anti-Spam Rules</p>
            <ul className="space-y-0.5">
              {matrix.antiSpamRules.map((r, i) => (
                <li key={i} className="text-xs text-gray-400 flex gap-2">
                  <span className="text-gray-600 shrink-0">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
