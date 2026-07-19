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

export async function fetchFundProject(id: number): Promise<FundProject | null> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`);
  if (!res.ok) return null;
  const p = await res.json();
  return {
    id: Number(p.id),
    name: p.name || `Project #${p.id}`,
    location: p.location || '',
    kontraktor: p.kontraktor,
    kuli: p.kuli,
    dailyRate: Number(p.dailyRate || 0),
    durationDays: Number(p.durationDays || 0),
    totalAmount: Number(p.totalAmount || 0),
    gasEstimate: 0.002,
  };
}
