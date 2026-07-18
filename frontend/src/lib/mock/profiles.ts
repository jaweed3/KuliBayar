import { USE_MOCK_DATA } from './projects';
import { API_BASE } from '@/lib/config';

export interface MockProfile {
  address: string;
  shortAddress: string;
  role: string;
  rating: number;
  jobs: number;
  name: string;
}

export const mockRecentProfiles: MockProfile[] = [
  { address: '0x742d35fb64a3b9e8f12c8f3e2a1b5c9d8e7f6a5b', shortAddress: '0x742d...8a21', role: 'Kuli', rating: 450, jobs: 12, name: 'Budi S.' },
  { address: '0x8f3a21cd98b7e6f5a4c3d2e1f0a9b8c7d6e5f4a3', shortAddress: '0x8f3a...3d45', role: 'Kontraktor', rating: 380, jobs: 8, name: 'Ahmad W.' },
  { address: '0x2c1b3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d', shortAddress: '0x2c1b...7e90', role: 'Kuli', rating: 500, jobs: 24, name: 'Dewi L.' },
];

export async function fetchRecentProfiles(): Promise<MockProfile[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockRecentProfiles;
  }

  // TODO: Implement real API endpoint
  return mockRecentProfiles;
}
