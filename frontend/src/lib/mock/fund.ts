import { USE_MOCK_DATA } from './projects';
import { API_BASE } from '@/lib/config';

export interface FundProject {
  id: number;
  name: string;
  location: string;
  kontraktor: string;
  kuli: string;
  dailyRate: number;
  durationDays: number;
  totalAmount: number;
  gasEstimate: number;
}

export const mockFundProjects: Record<number, FundProject> = {
  1: {
    id: 1,
    name: 'Pondasi Gudang Logistik',
    location: 'Cikarang, Bekasi',
    kontraktor: '0xac09...f2ff80',
    kuli: '0x7099...dc79c8',
    dailyRate: 0.01,
    durationDays: 10,
    totalAmount: 0.10,
    gasEstimate: 0.002,
  },
  2: {
    id: 2,
    name: 'Renovasi Ruko Blok A',
    location: 'Tebet, Jakarta',
    kontraktor: '0xac09...f2ff80',
    kuli: '0x5678...abcd',
    dailyRate: 0.015,
    durationDays: 5,
    totalAmount: 0.075,
    gasEstimate: 0.002,
  },
  3: {
    id: 3,
    name: 'Pemasangan Keramik Lt 2',
    location: 'Bintaro, Tangsel',
    kontraktor: '0xac09...f2ff80',
    kuli: '0x9abc...def0',
    dailyRate: 0.008,
    durationDays: 12,
    totalAmount: 0.096,
    gasEstimate: 0.002,
  },
};

export async function fetchFundProject(id: number): Promise<FundProject | null> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockFundProjects[id] || null;
  }

  const res = await fetch(`${API_BASE}/api/projects/${id}`);
  if (!res.ok) return null;
  return res.json();
}
