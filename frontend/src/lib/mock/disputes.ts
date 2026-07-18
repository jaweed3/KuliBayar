import { USE_MOCK_DATA } from './projects';
import { API_BASE } from '@/lib/config';

export interface DisputeHistory {
  id: string;
  reason: string;
  date: string;
  result: string;
  status: 'completed' | 'cancelled' | 'reviewing';
}

export const mockDisputeHistory: DisputeHistory[] = [
  { id: 'DISP-0012', reason: 'Kualitas Buruk', date: '02 Sep 2024', result: 'Favor Kuli (50%)', status: 'completed' },
  { id: 'DISP-0005', reason: 'Foto Tidak Sesuai', date: '15 Agu 2024', result: 'Kompromi', status: 'cancelled' },
];

export async function fetchDisputeHistory(): Promise<DisputeHistory[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockDisputeHistory;
  }

  const res = await fetch(`${API_BASE}/api/disputes/history`);
  if (!res.ok) throw new Error('Failed to fetch dispute history');
  return res.json();
}
