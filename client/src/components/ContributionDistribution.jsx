import { useState, useEffect } from 'react';
import api from '../utils/api.js';
import Spinner from './Spinner.jsx';

const CATEGORY_COLORS = {
  TASK:       { bar: 'bg-blue-500',   text: 'text-blue-400',   dot: 'bg-blue-500' },
  WORKSPACE:  { bar: 'bg-purple-500', text: 'text-purple-400', dot: 'bg-purple-500' },
  README:     { bar: 'bg-teal-500',   text: 'text-teal-400',   dot: 'bg-teal-500' },
  DISCUSSION: { bar: 'bg-orange-500', text: 'text-orange-400', dot: 'bg-orange-500' },
  MILESTONE:  { bar: 'bg-green-500',  text: 'text-green-400',  dot: 'bg-green-500' },
  GITHUB:     { bar: 'bg-gray-400',   text: 'text-gray-300',   dot: 'bg-gray-400' },
};

export default function ContributionDistribution({ teamId, userId = null }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    setLoading(true);
    const params = userId ? `?userId=${userId}` : '';
    api.get(`/teams/${teamId}/contributions/distribution${params}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teamId, userId]);

  if (loading) return <div className="flex justify-center py-6"><Spinner /></div>;
  if (!data)   return null;

  const entries = Object.entries(data.distribution).filter(([, v]) => v.score > 0);
  if (!entries.length) return (
    <p className="text-gray-500 text-sm text-center py-4">No contribution data yet.</p>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Contribution Breakdown
        </h4>
        <span className="text-xs text-gray-500">Total: <strong className="text-white">{data.total} pts</strong></span>
      </div>

      {entries
        .sort(([, a], [, b]) => b.score - a.score)
        .map(([cat, val]) => {
          const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.TASK;
          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className="text-xs text-gray-300">{val.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${colors.text}`}>{val.score} pts</span>
                  <span className="text-xs text-gray-500 w-8 text-right">{val.percentage}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                  style={{ width: `${val.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}
