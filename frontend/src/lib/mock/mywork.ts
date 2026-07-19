import { authFetch } from '@/lib/authFetch';

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

export async function fetchMyWorkProjects(): Promise<MyWorkProject[]> {
  const res = await authFetch('/api/projects/my-work');
  if (!res.ok) throw new Error('Failed to fetch my work projects');
  return res.json();
}
