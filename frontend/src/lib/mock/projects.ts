import { authFetch } from '@/lib/authFetch';

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

function mapKontraktor(p: any): KontraktorProject {
  return {
    id: p.id,
    name: p.name,
    location: p.location,
    status: p.status.toLowerCase(),
    statusLabel: p.status === 'Active' ? 'Aktif' : p.status === 'Created' ? 'Created' : p.status === 'Disputed' ? 'Sengketa' : 'Selesai',
    daysCompleted: Number(p.daysCompleted),
    durationDays: Number(p.durationDays),
    totalAmount: p.totalAmount || '0',
    releasedAmount: p.totalReleased || '0',
    kbId: `#KB-${String(8000 + p.id)}`,
  };
}

function mapKuli(p: any): KuliProject {
  return {
    id: p.id,
    name: p.name,
    location: p.location,
    status: p.status === 'Active' ? 'active' : p.status === 'Created' ? 'pending' : 'active',
    statusLabel: p.status === 'Active' ? 'Aktif' : p.status === 'Created' ? 'Menunggu' : p.status,
    daysCompleted: Number(p.daysCompleted),
    durationDays: Number(p.durationDays),
    dailyRate: p.dailyRate || '0',
    earned: p.totalReleased || '0',
    kontraktor: p.kontraktorName || p.kontraktor,
  };
}

export async function fetchKontraktorProjects(): Promise<KontraktorProject[]> {
  const res = await authFetch('/api/projects/role/kontraktor');
  if (!res.ok) throw new Error('Failed to fetch kontraktor projects');
  const data = await res.json();
  return data.map(mapKontraktor);
}

export async function fetchKuliProjects(): Promise<KuliProject[]> {
  const res = await authFetch('/api/projects/role/kuli');
  if (!res.ok) throw new Error('Failed to fetch kuli projects');
  const data = await res.json();
  return data.map(mapKuli);
}
