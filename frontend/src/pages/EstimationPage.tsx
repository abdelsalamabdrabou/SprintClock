import { useState } from 'react';
import type { SprintConfigDto, TeamMembers, StoryRow, CalculateResponse } from '../types';
import { calculateDeliveries } from '../services/estimationApi';

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
    frontendAssignee: '',
    backendAssignee: '',
    testAssignee: '',
    frontendHours: 0,
    backendHours: 0,
    testHours: 0,
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
      if (!s.frontendAssignee || !s.backendAssignee || !s.testAssignee)
        return `Story "${s.title || '(untitled)'}" needs assignees for all three teams.`;
      if (s.frontendHours < 0 || s.backendHours < 0 || s.testHours < 0)
        return 'Hours cannot be negative.';
      if (s.frontendHours === 0 && s.backendHours === 0 && s.testHours === 0)
        return `Story "${s.title}" must have at least one team with hours > 0.`;
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
          frontendAssignee: s.frontendAssignee,
          backendAssignee: s.backendAssignee,
          testAssignee: s.testAssignee,
          frontendHours: s.frontendHours,
          backendHours: s.backendHours,
          testHours: s.testHours,
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
                <th>FE Assignee</th>
                <th>FE Hours</th>
                <th>BE Assignee</th>
                <th>BE Hours</th>
                <th>Test Assignee</th>
                <th>Test Hours</th>
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
                    <select value={s.frontendAssignee}
                      onChange={e => updateRow(s.id, 'frontendAssignee', e.target.value)}>
                      <option value="">-- select --</option>
                      {teams.frontend.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </td>
                  <td>
                    <input type="number" min={0} step={0.5} value={s.frontendHours}
                      onChange={e => updateRow(s.id, 'frontendHours', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td>
                    <select value={s.backendAssignee}
                      onChange={e => updateRow(s.id, 'backendAssignee', e.target.value)}>
                      <option value="">-- select --</option>
                      {teams.backend.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </td>
                  <td>
                    <input type="number" min={0} step={0.5} value={s.backendHours}
                      onChange={e => updateRow(s.id, 'backendHours', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td>
                    <select value={s.testAssignee}
                      onChange={e => updateRow(s.id, 'testAssignee', e.target.value)}>
                      <option value="">-- select --</option>
                      {teams.test.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </td>
                  <td>
                    <input type="number" min={0} step={0.5} value={s.testHours}
                      onChange={e => updateRow(s.id, 'testHours', parseFloat(e.target.value) || 0)} />
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
