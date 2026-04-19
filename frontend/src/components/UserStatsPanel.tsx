import { useEffect, useState } from 'react';
import type { UserStats } from '../types';
import { getUserStats } from '../services/estimationApi';

interface Props {
  name: string;
  onClose: () => void;
}

const teamBadge: Record<string, string> = {
  Frontend: 'badge-fe',
  Backend: 'badge-be',
  Test: 'badge-test',
};

function fmt(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function UserStatsPanel({ name, onClose }: Props) {
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserStats(name)
      .then(setStats)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [name]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 {name}</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {loading && <p className="text-muted">Loading…</p>}
        {error && <div className="errors"><p>⚠️ {error}</p></div>}

        {!loading && stats.length === 0 && !error && (
          <p className="text-muted">No recorded work found for this user.</p>
        )}

        {stats.map(s => (
          <section className="modal-section" key={s.team}>
            <div className="modal-summary">
              <span className={`badge ${teamBadge[s.team] ?? ''}`}>{s.team}</span>
              <span className="stat-pill">{s.totalHours}h total</span>
              <span className="stat-pill">{s.storyCount} {s.storyCount === 1 ? 'story' : 'stories'}</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Sprint Date</th>
                    <th>Story</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {s.stories.map((item, i) => (
                    <tr key={i}>
                      <td className="text-muted">{fmt(item.sprintCreatedAt)}</td>
                      <td>{item.storyTitle}</td>
                      <td>{item.hours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
