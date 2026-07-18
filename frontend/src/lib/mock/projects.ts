// Mock project data for development
// Switch to real API calls by changing USE_MOCK_DATA to false

export const USE_MOCK_DATA = true;

export interface KontraktorProject {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'created' | 'disputed' | 'completed';
  statusLabel: string;
  daysCompleted: number;
  durationDays: number;
  totalAmount: string;
  releasedAmount: string;
  kbId: string;
}

export interface KuliProject {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'pending' | 'completed';
  statusLabel: string;
  daysCompleted: number;
  durationDays: number;
  dailyRate: string;
  earned: string;
  kontraktor: string;
}

export type Project = KontraktorProject | KuliProject;

export const mockKontraktorProjects: KontraktorProject[] = [
  {
    id: 1,
    name: 'Pondasi Gudang Logistik',
    location: 'Cikarang, Bekasi',
    status: 'active',
    statusLabel: 'Aktif',
    daysCompleted: 3,
    durationDays: 10,
    totalAmount: '0.100',
    releasedAmount: '0.030',
    kbId: '#KB-8921',
  },
  {
    id: 2,
    name: 'Renovasi Ruko Blok A',
    location: 'Tebet, Jakarta',
    status: 'created',
    statusLabel: 'Created',
    daysCompleted: 0,
    durationDays: 5,
    totalAmount: '0.000',
    releasedAmount: '0.000',
    kbId: '#KB-8940',
  },
  {
    id: 3,
    name: 'Pemasangan Keramik Lt 2',
    location: 'Bintaro, Tangsel',
    status: 'disputed',
    statusLabel: 'Sengketa',
    daysCompleted: 8,
    durationDays: 12,
    totalAmount: '0.060',
    releasedAmount: '0.036',
    kbId: '#KB-8711',
  },
];

export const mockKuliProjects: KuliProject[] = [
  {
    id: 1,
    name: 'Pondasi Gudang Logistik',
    location: 'Cikarang, Bekasi',
    status: 'active',
    statusLabel: 'Aktif',
    daysCompleted: 3,
    durationDays: 10,
    dailyRate: '0.010',
    earned: '0.030',
    kontraktor: 'Budi S.',
  },
  {
    id: 2,
    name: 'Renovasi Ruko Blok A',
    location: 'Tebet, Jakarta',
    status: 'active',
    statusLabel: 'Aktif',
    daysCompleted: 1,
    durationDays: 5,
    dailyRate: '0.015',
    earned: '0.015',
    kontraktor: 'Ahmad W.',
  },
  {
    id: 3,
    name: 'Pemasangan Keramik Lt 2',
    location: 'Bintaro, Tangsel',
    status: 'pending',
    statusLabel: 'Menunggu',
    daysCompleted: 0,
    durationDays: 12,
    dailyRate: '0.008',
    earned: '0.000',
    kontraktor: 'Dewi L.',
  },
];
