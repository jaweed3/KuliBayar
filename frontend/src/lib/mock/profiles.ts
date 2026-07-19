import { API_BASE } from '@/lib/config';

export interface MockProfile {
  address: string;
  shortAddress: string;
  name: string;
  role: string;
  rating: number;
  jobs: number;
}

export async function fetchRecentProfiles(): Promise<MockProfile[]> {
  return [];
}
