import { useState } from 'react';
import type { SprintConfigDto, TeamMembers, StoryRow, CalculateResponse } from '../types';
import { calculateDeliveries } from '../services/estimationApi';
import TeamAssigneeInput from '../components/TeamAssigneeInput';

interface Props {
  config: SprintConfigDto;
  teams: TeamMembers;
  onBack: () => void;
  onResults: (response: CalculateResponse) => void;
}

function newRow(): StoryRow {
  return {
    id: crypto.randomUUID(),
    title: '',
    frontend: [],
    backend: [],
    test: [],
  };
}

export default function EstimationPage({ config, teams, onBack, onResults }: Props) {
  const [stories, setStories] = useState<StoryRow[]>([newRow()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRow = <K extends keyof StoryRow>(id: string, key: K, value: StoryRow[K]) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s));
  };

  const addStory = () => setStories(prev => [...prev, newRow()]);

  const removeStory = (id: string) =>
    setStories(prev => prev.filter(s => s.id !== id));

  const validate = (): string | null => {
    for (const s of stories) {
      if (!s.title.trim()) return 'All stories must have a title.';
      const allAssignees = [...s.frontend, ...s.backend, ...s.test];
      if (allAssignees.length === 0)
        return `Story "${s.title || '(untitled)'}" has no assignees.`;
      if (!allAssignees.some(a => a.hours > 0))
        return `Story "${s.title || '(untitled)'}" must have at least one assignee with hours > 0.`;
      const zeroHour = allAssignees.find(a => a.hours <= 0);
      if (zeroHour)
        return `Story "${s.title}": assignee "${zeroHour.name}" has 0 hours — set hours or remove them.`;
      if (allAssignees.some(a => a.hours < 0))
        return `Story "${s.title}": hours cannot be negative.`;
    }
    const titles = stories.map(s => s.title.trim().toLowerCase());
    if (new Set(titles).size !== titles.length) return 'Story titles must be unique.';
    return null;
  };

  const handleCalculate = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setLoading(true);
    try {
      const response = await calculateDeliveries({
        config,
        stories: stories.map(s => ({
          title: s.title,
          frontend: s.frontend,
          backend: s.backend,
          test: s.test,
        })),
      });
      onResults(response);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <h1>📋 Story Estimation</h1>
      </div>

      <section className="card">
        <div className="team-roster">
          {(['frontend', 'backend', 'test'] as const).map(t => (
            <div key={t} className="roster-group">
              <strong>{t.charAt(0).toUpperCase() + t.slice(1)}</strong>
              <span>{teams[t].join(', ')}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Story Title</th>
                <th>Frontend</th>
                <th>Backend</th>
                <th>Test</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stories.map(s => (
                <tr key={s.id}>
                  <td>
                    <input
                      placeholder="Story title"
                      value={s.title}
                      onChange={e => updateRow(s.id, 'title', e.target.value)}
                    />
                  </td>
                  <td>
                    <TeamAssigneeInput
                      members={teams.frontend}
                      value={s.frontend}
                      onChange={v => updateRow(s.id, 'frontend', v)}
                    />
                  </td>
                  <td>
                    <TeamAssigneeInput
                      members={teams.backend}
                      value={s.backend}
                      onChange={v => updateRow(s.id, 'backend', v)}
                    />
                  </td>
                  <td>
                    <TeamAssigneeInput
                      members={teams.test}
                      value={s.test}
                      onChange={v => updateRow(s.id, 'test', v)}
                    />
                  </td>
                  <td>
                    {stories.length > 1 && (
                      <button className="btn-danger" onClick={() => removeStory(s.id)}>✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-actions">
          <button className="btn-secondary" onClick={addStory}>+ Add Story</button>
        </div>
      </section>

      {error && <div className="errors"><p>⚠️ {error}</p></div>}

      <button className="btn-primary" onClick={handleCalculate} disabled={loading}>
        {loading ? 'Calculating…' : 'Calculate Deliveries →'}
      </button>
    </div>
  );
}
