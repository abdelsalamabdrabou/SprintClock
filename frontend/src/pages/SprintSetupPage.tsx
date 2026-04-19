import { useState } from 'react';
import type { SprintConfigDto, TeamMembers } from '../types';

interface Props {
  onNext: (config: SprintConfigDto, teams: TeamMembers) => void;
}

const defaultConfig: SprintConfigDto = {
  startDateTime: new Date().toISOString().slice(0, 16),
  maxDailyHours: 8,
  workFrom: '09:00',
  workUntil: '17:00',
};

const defaultTeams: TeamMembers = {
  frontend: [''],
  backend: [''],
  test: [''],
};

export default function SprintSetupPage({ onNext }: Props) {
  const [config, setConfig] = useState<SprintConfigDto>(defaultConfig);
  const [teams, setTeams] = useState<TeamMembers>(defaultTeams);
  const [errors, setErrors] = useState<string[]>([]);

  const updateMember = (team: keyof TeamMembers, idx: number, value: string) => {
    setTeams(prev => {
      const updated = [...prev[team]];
      updated[idx] = value;
      return { ...prev, [team]: updated };
    });
  };

  const addMember = (team: keyof TeamMembers) =>
    setTeams(prev => ({ ...prev, [team]: [...prev[team], ''] }));

  const removeMember = (team: keyof TeamMembers, idx: number) =>
    setTeams(prev => ({ ...prev, [team]: prev[team].filter((_, i) => i !== idx) }));

  const validate = (): string[] => {
    const errs: string[] = [];
    const start = new Date(config.startDateTime);
    const day = start.getDay(); // 0=Sun, 5=Fri, 6=Sat
    if (day === 5 || day === 6) errs.push('Sprint cannot start on a weekend (Friday or Saturday).');

    const [fh, fm] = config.workFrom.split(':').map(Number);
    const [uh, um] = config.workUntil.split(':').map(Number);
    const windowHours = (uh * 60 + um - (fh * 60 + fm)) / 60;
    if (windowHours <= 0) errs.push('Work Until must be after Work From.');
    if (config.maxDailyHours > windowHours)
      errs.push(`Max Daily Hours (${config.maxDailyHours}) cannot exceed workday window (${windowHours}h).`);
    if (config.maxDailyHours <= 0) errs.push('Max Daily Hours must be greater than 0.');

    (['frontend', 'backend', 'test'] as const).forEach(t => {
      const valid = teams[t].filter(n => n.trim().length > 0);
      if (valid.length === 0) errs.push(`${t.charAt(0).toUpperCase() + t.slice(1)} team needs at least 1 member.`);
    });

    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    const cleanedTeams: TeamMembers = {
      frontend: teams.frontend.filter(n => n.trim().length > 0),
      backend: teams.backend.filter(n => n.trim().length > 0),
      test: teams.test.filter(n => n.trim().length > 0),
    };
    onNext(config, cleanedTeams);
  };

  return (
    <div className="page">
      <h1>⚙️ Sprint Setup</h1>

      <section className="card">
        <h2>Sprint Configuration</h2>
        <div className="field">
          <label>Sprint Start Date & Time</label>
          <input
            type="datetime-local"
            value={config.startDateTime}
            onChange={e => setConfig(c => ({ ...c, startDateTime: e.target.value }))}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Work From</label>
            <input type="time" value={config.workFrom}
              onChange={e => setConfig(c => ({ ...c, workFrom: e.target.value }))} />
          </div>
          <div className="field">
            <label>Work Until</label>
            <input type="time" value={config.workUntil}
              onChange={e => setConfig(c => ({ ...c, workUntil: e.target.value }))} />
          </div>
          <div className="field">
            <label>Max Daily Hours</label>
            <input type="number" min={1} max={24} step={0.5} value={config.maxDailyHours}
              onChange={e => setConfig(c => ({ ...c, maxDailyHours: parseFloat(e.target.value) }))} />
          </div>
        </div>
      </section>

      {(['frontend', 'backend', 'test'] as const).map(teamKey => (
        <section className="card" key={teamKey}>
          <h2>{teamKey.charAt(0).toUpperCase() + teamKey.slice(1)} Team</h2>
          {teams[teamKey].map((name, idx) => (
            <div className="field-row" key={idx}>
              <input
                placeholder={`Member ${idx + 1}`}
                value={name}
                onChange={e => updateMember(teamKey, idx, e.target.value)}
              />
              {teams[teamKey].length > 1 && (
                <button className="btn-danger" onClick={() => removeMember(teamKey, idx)}>✕</button>
              )}
            </div>
          ))}
          <button className="btn-secondary" onClick={() => addMember(teamKey)}>+ Add Member</button>
        </section>
      ))}

      {errors.length > 0 && (
        <div className="errors">
          {errors.map((e, i) => <p key={i}>⚠️ {e}</p>)}
        </div>
      )}

      <button className="btn-primary" onClick={handleNext}>Next: Estimation →</button>
    </div>
  );
}
