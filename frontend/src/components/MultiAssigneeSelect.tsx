import { useState, useRef, useEffect } from 'react';

interface Props {
  members: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}

export default function MultiAssigneeSelect({ members, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allSelected = members.length > 0 && members.every(m => selected.includes(m));

  const toggleOne = (e: React.MouseEvent, member: string) => {
    e.stopPropagation();
    onChange(
      selected.includes(member)
        ? selected.filter(m => m !== member)
        : [...selected, member]
    );
  };

  const toggleAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(allSelected ? [] : [...members]);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Flip upward if not enough space below
  useEffect(() => {
    if (!open || !dropdownRef.current || !containerRef.current) return;
    const dropdown = dropdownRef.current;
    const trigger = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - trigger.bottom;
    const spaceAbove = trigger.top;
    if (spaceBelow < dropdown.offsetHeight && spaceAbove > spaceBelow) {
      dropdown.style.top = 'auto';
      dropdown.style.bottom = '100%';
    } else {
      dropdown.style.top = 'calc(100% + 4px)';
      dropdown.style.bottom = 'auto';
    }
  }, [open]);

  if (members.length === 0) {
    return <span className="no-members">No members</span>;
  }

  return (
    <div className="multi-select" ref={containerRef}>
      <button
        type="button"
        className={`multi-select-trigger${selected.length > 0 ? ' has-value' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="multi-select-label">
          {selected.length === 0
            ? 'Select…'
            : selected.length === members.length
              ? 'All'
              : selected.length === 1
                ? selected[0]
                : `${selected.length} selected`}
        </span>
        <span className="multi-select-arrow">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          className="multi-select-dropdown"
          ref={dropdownRef}
          onMouseDown={e => e.stopPropagation()}
        >
          {/* All option */}
          <div
            className={`multi-select-option multi-select-all${allSelected ? ' is-checked' : ''}`}
            onClick={toggleAll}
          >
            <span className="multi-select-checkbox">{allSelected ? '☑' : '☐'}</span>
            <span>All</span>
          </div>
          <div className="multi-select-divider" />
          {members.map(m => {
            const checked = selected.includes(m);
            return (
              <div
                key={m}
                className={`multi-select-option${checked ? ' is-checked' : ''}`}
                onClick={e => toggleOne(e, m)}
              >
                <span className="multi-select-checkbox">{checked ? '☑' : '☐'}</span>
                <span>{m}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
