import { USE_MOCK_DATA } from './projects';
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

export const mockPayments: Payment[] = [
  { id: 1, projectName: 'Pondasi Gudang Logistik', projectId: 1, day: 3, amount: '0.010', timestamp: '15 Jan 2024, 16:30 WIB', status: 'success', txHash: '0x7f3a...8a21' },
  { id: 2, projectName: 'Pondasi Gudang Logistik', projectId: 1, day: 2, amount: '0.010', timestamp: '14 Jan 2024, 15:45 WIB', status: 'success', txHash: '0x8b2c...3d45' },
  { id: 3, projectName: 'Pondasi Gudang Logistik', projectId: 1, day: 1, amount: '0.010', timestamp: '13 Jan 2024, 14:20 WIB', status: 'success', txHash: '0x9d4e...5f67' },
  { id: 4, projectName: 'Renovasi Ruko Blok A', projectId: 2, day: 1, amount: '0.015', timestamp: '12 Jan 2024, 17:00 WIB', status: 'success', txHash: '0xa1b2...c3d4' },
  { id: 5, projectName: 'Pondasi Gudang Logistik', projectId: 1, day: 4, amount: '0.010', timestamp: '16 Jan 2024, 15:30 WIB', status: 'pending', txHash: 'Menunggu verifikasi...' },
];

export async function fetchPayments(): Promise<Payment[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockPayments;
  }

  const res = await fetch(`${API_BASE}/api/payments`);
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}
