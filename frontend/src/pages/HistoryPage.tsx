import { useEffect, useState } from 'react';
import type { SprintSummary, CalculateResponse } from '../types';
import { getSprints, getSprintById } from '../services/estimationApi';

interface Props {
  onViewSprint: (response: CalculateResponse) => void;
  onBack: () => void;
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function HistoryPage({ onViewSprint, onBack }: Props) {
  const [sprints, setSprints] = useState<SprintSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    getSprints()
      .then(setSprints)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const handleView = async (id: string) => {
    setLoadingId(id);
    try {
      const response = await getSprintById(id);
      onViewSprint(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sprint');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <h1>📜 Sprint History</h1>
      </div>

      {loading && <p className="text-muted">Loading history…</p>}
      {error && <div className="errors"><p>⚠️ {error}</p></div>}

      {!loading && sprints.length === 0 && !error && (
        <div className="card">
          <p className="text-muted">No sprints saved yet. Complete an estimation to see history here.</p>
        </div>
      )}

      {sprints.length > 0 && (
        <section className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Created At</th>
                  <th>Feature Delivery</th>
                  <th>Stories</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sprints.map((s, i) => (
                  <tr key={s.id}>
                    <td className="text-muted">{sprints.length - i}</td>
                    <td>{fmt(s.createdAt)}</td>
                    <td className="final-date">{fmt(s.featureDelivery)}</td>
                    <td>{s.totalStories}</td>
                    <td>
                      <button
                        className="btn-secondary"
                        onClick={() => handleView(s.id)}
                        disabled={loadingId === s.id}
                      >
                        {loadingId === s.id ? '…' : 'View →'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
