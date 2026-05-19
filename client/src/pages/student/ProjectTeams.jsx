import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';
import api from '../../utils/api.js';

export default function ProjectTeams() {
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readmes, setReadmes] = useState({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data } = await api.get(`/projects/${projectId}/teams`);
        if (!mounted) return;
        setTeams(data.teams || []);
        setLoading(false);
      } catch (err) {
        console.error(err?.response?.data || err);
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [projectId]);

  useEffect(() => {
    // Fetch readme for teams the user can access (their own teams or faculty)
    async function loadReadmes() {
      const promises = teams.map(async (team) => {
        const isMember = user && team.members.some(m => String(m.user?._id || m.user) === String(user._id));
        const canView = isMember || (user && user.role === 'faculty');
        if (!canView) return { id: team._id, readme: null, allowed: false };
        try {
          const { data } = await api.get(`/teams/${team._id}/readme`);
          return { id: team._id, readme: data.latest?.content || '', allowed: true };
        } catch (err) {
          return { id: team._id, readme: null, allowed: false };
        }
      });

      const results = await Promise.all(promises);
      const map = {};
      results.forEach(r => { map[r.id] = r; });
      setReadmes(map);
    }

    if (teams.length) loadReadmes();
  }, [teams, user]);

  if (loading) return <div className="p-6">Loading teams...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Project Teams</h2>
      {teams.length === 0 && (
        <div className="text-sm text-muted-foreground">No teams found for this project.</div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {teams.map(team => {
          const memberCount = (team.members || []).length;
          const lead = team.teamLead;
          const r = readmes[team._id] || {};
          const isMember = user && team.members.some(m => String(m.user?._id || m.user) === String(user._id));

          return (
            <div key={team._id} className="bg-surface-2 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{team.name}</h3>
                  <div className="text-sm text-muted-foreground">Status: {team.status || 'pending'}</div>
                </div>
                <div className="text-right text-sm">
                  <div>Members: {memberCount}</div>
                  {lead && <div>Lead: {lead.name || lead.email || '—'}</div>}
                </div>
              </div>

              <div className="mt-3 text-sm">
                <strong>Members</strong>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  {(team.members || []).map((m, idx) => (
                    <li key={idx}>{m.user?.name || m.user?.email || m.user}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 text-sm">
                <strong>README</strong>
                <div className="mt-1">
                  {r.allowed === false && !isMember && (
                    <div className="text-xs text-muted-foreground">Private — only team members can view README.</div>
                  )}
                  {r.allowed && r.readme && (
                    <div className="mt-1 text-sm prose max-h-40 overflow-auto break-words">{r.readme.substring(0, 800)}</div>
                  )}
                  {r.allowed && !r.readme && (
                    <div className="text-xs text-muted-foreground">No README yet.</div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Link to={`/team/${team._id}/workspace`} className="text-sm text-primary">Open Workspace</Link>
                <Link to={`/team/${team._id}/workspace`} className="text-sm text-muted-foreground">View versions</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
