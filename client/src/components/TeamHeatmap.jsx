import { useState, useEffect } from 'react';
import api from '../utils/api.js';
import Spinner from './Spinner.jsx';

function getIntensityClass(score) {
  if (!score || score === 0) return 'bg-gray-800 border border-gray-700/50';
  if (score < 5)  return 'bg-green-900 border border-green-800';
  if (score < 15) return 'bg-green-700 border border-green-600';
  if (score < 30) return 'bg-green-500 border border-green-400';
  return 'bg-green-400 border border-green-300';
}

function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export default function TeamHeatmap({ teamId, members = [] }) {
  const [heatmap, setHeatmap] = useState({});
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);

  const days = getLast30Days();

  useEffect(() => {
    if (!teamId) return;
    setLoading(true);
    api.get(`/teams/${teamId}/contributions/heatmap?days=30`)
      .then(r => setHeatmap(r.data.heatmap || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) return <div className="flex justify-center py-6"><Spinner /></div>;

  const memberIds = Object.keys(heatmap);
  if (!memberIds.length) return (
    <p className="text-gray-500 text-sm text-center py-4">No activity in the last 30 days.</p>
  );

  function getMemberName(uid) {
    const m = members.find(m => String(m.user?._id || m.user) === uid);
    return m?.user?.name || 'Member';
  }

  // Week labels
  const weekLabels = [];
  for (let i = 0; i < 30; i += 7) {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    weekLabels.push(d.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Activity Heatmap — Last 30 Days</h4>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>Less</span>
          {['bg-gray-800', 'bg-green-900', 'bg-green-700', 'bg-green-500', 'bg-green-400'].map(c => (
            <span key={c} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      {memberIds.map(uid => {
        const memberDays = heatmap[uid] || {};
        const totalScore = Object.values(memberDays).reduce((s, v) => s + v, 0);
        return (
          <div key={uid} className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-300 w-24 truncate">{getMemberName(uid)}</span>
              <span className="text-xs text-gray-500">{Math.round(totalScore)} pts</span>
            </div>
            <div className="flex gap-0.5 flex-wrap">
              {days.map(day => {
                const score = memberDays[day] || 0;
                const label = `${day}: ${score > 0 ? score.toFixed(1) + ' pts' : 'No activity'}`;
                return (
                  <div
                    key={day}
                    className={`w-4 h-4 rounded-sm cursor-default transition-transform hover:scale-125 ${getIntensityClass(score)}`}
                    title={label}
                    onMouseEnter={() => setTooltip({ day, score, uid })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {tooltip && (
        <div className="fixed z-50 bg-gray-900 border border-gray-700 text-xs text-white px-2 py-1.5 rounded shadow-lg pointer-events-none"
             style={{ top: 'auto', right: 'auto' }}>
          <strong>{getMemberName(tooltip.uid)}</strong><br />
          {tooltip.day}: {tooltip.score > 0 ? `${tooltip.score.toFixed(1)} pts` : 'No activity'}
        </div>
      )}
    </div>
  );
}
