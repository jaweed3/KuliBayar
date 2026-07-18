import { authFetch } from '@/lib/authFetch';
import {
  USE_MOCK_DATA,
  mockKontraktorProjects,
  mockKuliProjects,
  KontraktorProject,
  KuliProject,
} from '@/lib/mock/projects';

// Fetch kontraktor projects
export async function fetchKontraktorProjects(): Promise<KontraktorProject[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockKontraktorProjects;
  }

  const res = await authFetch('/api/projects/role/kontraktor');
  if (!res.ok) throw new Error('Failed to fetch kontraktor projects');
  return res.json();
}

// Fetch kuli projects
export async function fetchKuliProjects(): Promise<KuliProject[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockKuliProjects;
  }

  const res = await authFetch('/api/projects/role/kuli');
  if (!res.ok) throw new Error('Failed to fetch kuli projects');
  return res.json();
}
