import { useState } from 'react';
import type { CalculateResponse, SprintConfigDto } from '../types';
import UserStatsPanel from '../components/UserStatsPanel';

interface Props {
  response: CalculateResponse;
  config: SprintConfigDto;
  onBack: () => void;
  onReset: () => void;
}

function fmt(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

const teamColors: Record<string, string> = {
  Frontend: 'badge-fe',
  Backend: 'badge-be',
  Test: 'badge-test',
};

export default function StatisticsPage({ response, config, onBack, onReset }: Props) {
  const { results, workloads, featureDelivery, totalStories,
    totalFrontendHours, totalBackendHours, totalTestHours } = response;

  const teams = ['Frontend', 'Backend', 'Test'];
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  return (
    <div className="page">
      {selectedUser && (
        <UserStatsPanel name={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
      <div className="page-header">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <h1>📊 Statistics</h1>
        <button className="btn-secondary" onClick={onReset}>🔄 New Sprint</button>
      </div>

      <section className="card config-card">
        <h2>Sprint Configuration</h2>
        <div className="config-grid">
          <div className="config-item">
            <span className="config-label">Start Date</span>
            <span className="config-value">{fmt(config.startDateTime)}</span>
          </div>
          <div className="config-item">
            <span className="config-label">Work Hours</span>
            <span className="config-value">{config.workFrom} – {config.workUntil}</span>
          </div>
          <div className="config-item">
            <span className="config-label">Max Daily Hours</span>
            <span className="config-value">{config.maxDailyHours}h</span>
          </div>
        </div>
      </section>

      <section className="feature-banner">
        <div>
          <div className="banner-label">🏁 Feature Delivery</div>
          <div className="banner-date">{fmt(featureDelivery)}</div>
        </div>
        <div className="banner-summary">
          <span>{totalStories} stories</span>
          <span>FE: {totalFrontendHours}h</span>
          <span>BE: {totalBackendHours}h</span>
          <span>Test: {totalTestHours}h</span>
        </div>
      </section>

      <section className="card">
        <h2>Delivery per Story</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Story</th>
                <th>Frontend Delivery</th>
                <th>Backend Delivery</th>
                <th>Test Delivery</th>
                <th>Final Delivery</th>
                <th>Critical Path</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.storyTitle}>
                  <td>{r.storyTitle}</td>
                  <td className={r.criticalPathTeam === 'Frontend' ? 'critical' : ''}>{fmt(r.frontendDelivery)}</td>
                  <td className={r.criticalPathTeam === 'Backend' ? 'critical' : ''}>{fmt(r.backendDelivery)}</td>
                  <td className={r.criticalPathTeam === 'Test' ? 'critical' : ''}>{fmt(r.testDelivery)}</td>
                  <td className="final-date">{fmt(r.finalDelivery)}</td>
                  <td><span className={`badge ${teamColors[r.criticalPathTeam] ?? ''}`}>{r.criticalPathTeam}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {teams.map(team => {
        const members = workloads.filter(w => w.team === team);
        if (members.length === 0) return null;
        return (
          <section className="card" key={team}>
            <h2>{team} Team Workload</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Team Member</th>
                    <th>Total Hours</th>
                    <th>Stories</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.name}>
                      <td>
                        <button className="member-btn" onClick={() => setSelectedUser(m.name)}>
                          {m.name}
                        </button>
                      </td>
                      <td>{m.totalHours}h</td>
                      <td>{m.storyCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
