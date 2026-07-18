import { USE_MOCK_DATA } from './projects';
import { API_BASE } from '@/lib/config';

export interface MyWorkProject {
  id: number;
  name: string;
  location: string;
  kontraktor: string;
  kontraktorAddress: string;
  status: 'active' | 'pending';
  statusLabel: string;
  daysCompleted: number;
  durationDays: number;
  dailyRate: string;
  totalEarned: string;
  lastProof: string;
}

export const mockMyWorkProjects: MyWorkProject[] = [
  {
    id: 1,
    name: 'Pondasi Gudang Logistik',
    location: 'Cikarang Selatan, Bekasi',
    kontraktor: 'Budi Santoso',
    kontraktorAddress: '0xac09...f2ff80',
    status: 'active',
    statusLabel: 'Aktif',
    daysCompleted: 3,
    durationDays: 10,
    dailyRate: '0.010',
    totalEarned: '0.030',
    lastProof: '2 jam lalu',
  },
  {
    id: 2,
    name: 'Renovasi Ruko Blok A',
    location: 'Tebet, Jakarta Selatan',
    kontraktor: 'Ahmad Wijaya',
    kontraktorAddress: '0x5678...abcd',
    status: 'active',
    statusLabel: 'Aktif',
    daysCompleted: 1,
    durationDays: 5,
    dailyRate: '0.015',
    totalEarned: '0.015',
    lastProof: '5 jam lalu',
  },
  {
    id: 3,
    name: 'Pemasangan Keramik Lt 2',
    location: 'Bintaro, Tangerang Selatan',
    kontraktor: 'Dewi Lestari',
    kontraktorAddress: '0x9abc...def0',
    status: 'pending',
    statusLabel: 'Menunggu',
    daysCompleted: 0,
    durationDays: 12,
    dailyRate: '0.008',
    totalEarned: '0.000',
    lastProof: 'Belum ada',
  },
];

export async function fetchMyWorkProjects(): Promise<MyWorkProject[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockMyWorkProjects;
  }

  const res = await fetch(`${API_BASE}/api/projects/my-work`);
  if (!res.ok) throw new Error('Failed to fetch my work projects');
  return res.json();
}
