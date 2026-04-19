import type { AssigneeHours } from '../types';

interface Props {
  members: string[];
  value: AssigneeHours[];
  onChange: (value: AssigneeHours[]) => void;
}

export default function TeamAssigneeInput({ members, value, onChange }: Props) {
  const assignedNames = value.map(a => a.name);
  const available = members.filter(m => !assignedNames.includes(m));

  const add = (name: string) => {
    if (!name) return;
    onChange([...value, { name, hours: 0 }]);
  };

  const remove = (name: string) => {
    onChange(value.filter(a => a.name !== name));
  };

  const setHours = (name: string, hours: number) => {
    onChange(value.map(a => a.name === name ? { ...a, hours } : a));
  };

  if (members.length === 0) {
    return <span className="no-members">No members</span>;
  }

  return (
    <div className="team-assignee-input">
      {value.map(a => (
        <div key={a.name} className="assignee-row">
          <span className="assignee-name">{a.name}</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={a.hours}
            className="assignee-hours"
            onChange={e => setHours(a.name, parseFloat(e.target.value) || 0)}
          />
          <span className="assignee-unit">h</span>
          <button
            type="button"
            className="btn-remove-assignee"
            onClick={() => remove(a.name)}
          >✕</button>
        </div>
      ))}
      {available.length > 0 && (
        <select
          value=""
          className="assignee-add-select"
          onChange={e => add(e.target.value)}
        >
          <option value="">+ Add member</option>
          {available.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      )}
    </div>
  );
}
