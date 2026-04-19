import type { CalculateRequest, CalculateResponse } from '../types';

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
