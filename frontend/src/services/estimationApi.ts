import type { CalculateRequest, CalculateResponse, SprintSummary, UserStats } from '../types';

const API_BASE = 'http://localhost:5048/api';

export async function calculateDeliveries(request: CalculateRequest): Promise<CalculateResponse> {
  const res = await fetch(`${API_BASE}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Calculation failed');
  }

  return res.json();
}

export async function getSprints(): Promise<SprintSummary[]> {
  const res = await fetch(`${API_BASE}/sprints`);
  if (!res.ok) throw new Error('Failed to load sprint history');
  return res.json();
}

export async function getSprintById(id: string): Promise<CalculateResponse> {
  const res = await fetch(`${API_BASE}/sprints/${id}`);
  if (!res.ok) throw new Error('Sprint not found');
  return res.json();
}

export async function deleteSprint(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sprints/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) throw new Error('Failed to delete sprint');
}

export async function getUserStats(name: string): Promise<UserStats[]> {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(name)}/stats`);
  if (!res.ok) throw new Error('Failed to load user stats');
  return res.json();
}
