import { API_BASE } from '@/lib/config';

export interface DisputeHistory {
  id: string;
  reason: string;
  date: string;
  result: string;
  status: 'completed' | 'cancelled' | 'reviewing';
}

export async function fetchDisputeHistory(): Promise<DisputeHistory[]> {
  const res = await fetch(`${API_BASE}/api/disputes/history`);
  if (!res.ok) throw new Error('Failed to fetch dispute history');
  return res.json();
}
