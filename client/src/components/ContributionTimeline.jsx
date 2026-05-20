import { useState, useEffect } from 'react';
import api from '../utils/api.js';
import Spinner from './Spinner.jsx';

const EVENT_ICONS = {
  TASK_CREATED:         '📝',
  TASK_COMPLETED:       '✅',
  TASK_REVIEWED:        '🔍',
  README_EDIT_MINOR:    '📄',
  README_EDIT_MAJOR:    '📖',
  FILE_UPLOAD:          '📎',
  FILE_UPDATE:          '🔄',
  DOCUMENTATION_UPLOAD: '📋',
  DISCUSSION_POSTED:    '💬',
  DISCUSSION_REPLY:     '↩️',
  MILESTONE_SUBMITTED:  '🏁',
  MILESTONE_REVISED:    '🔧',
  GITHUB_COMMIT:        '💻',
  GITHUB_PR_OPENED:     '🔀',
  GITHUB_PR_MERGED:     '✨',
  GITHUB_ISSUE_COMMENT: '💡',
};

const QUALITY_COLORS = {
  high:   'text-green-400',
  medium: 'text-blue-400',
  low:    'text-gray-400',
};

const STATE_BADGES = {
  verified:   { label: 'Verified',   cls: 'bg-green-900 text-green-300' },
  suspicious: { label: 'Flagged',    cls: 'bg-yellow-900 text-yellow-300' },
  invalid:    { label: 'Invalid',    cls: 'bg-red-900 text-red-300' },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ContributionTimeline({ teamId, memberId = null, limit = 50 }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!teamId) return;
    setLoading(true);
    const params = new URLSearchParams({ limit });
    if (memberId) params.set('userId', memberId);

    api.get(`/teams/${teamId}/contributions/timeline?${params}`)
      .then(r => setTimeline(r.data.timeline))
      .catch(() => setError('Could not load activity'))
      .finally(() => setLoading(false));
  }, [teamId, memberId, limit]);

  if (loading) return (
    <div className="flex justify-center py-8"><Spinner /></div>
  );
  if (error) return (
    <p className="text-red-400 text-sm text-center py-4">{error}</p>
  );
  if (!timeline.length) return (
    <p className="text-gray-500 text-sm text-center py-6">No activity recorded yet.</p>
  );

  return (
    <div className="space-y-1">
      {timeline.map((event, idx) => {
        const badge = STATE_BADGES[event.validationState] || STATE_BADGES.verified;
        const qColor = QUALITY_COLORS[event.qualityLevel] || QUALITY_COLORS.medium;
        return (
          <div key={event._id || idx}
               className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors
                 ${event.isSuspicious
                   ? 'bg-yellow-950/30 border border-yellow-800/40'
                   : 'bg-gray-800/40 hover:bg-gray-800/70'
                 }`}>
            {/* Icon */}
            <span className="text-lg leading-none mt-0.5 shrink-0">
              {EVENT_ICONS[event.eventType] || '⚡'}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-200 truncate">
                  {event.user?.name || 'Unknown'}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {event.description}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-500">{timeAgo(event.createdAt)}</span>
                {event.isSuspicious && (
                  <span className="text-xs text-yellow-400" title={event.suspicionReason}>
                    ⚠ {event.suspicionReason}
                  </span>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="shrink-0 text-right">
              <span className={`text-sm font-bold ${qColor}`}>
                +{event.finalScore}
              </span>
              <div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
