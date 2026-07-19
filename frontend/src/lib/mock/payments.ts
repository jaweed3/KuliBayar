import { API_BASE } from '@/lib/config';

export interface Payment {
  id: number;
  projectName: string;
  projectId: number;
  day: number;
  amount: string;
  timestamp: string;
  status: 'success' | 'pending';
  txHash: string;
}

export async function fetchPayments(): Promise<Payment[]> {
  const res = await fetch(`${API_BASE}/api/payments`);
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}
