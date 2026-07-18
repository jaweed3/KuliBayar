import { useState, useEffect } from 'react';
import { KontraktorProject, KuliProject } from '@/lib/mock/projects';
import { fetchKontraktorProjects, fetchKuliProjects } from '@/lib/api/projects';

export type UserRole = 'kontraktor' | 'kuli';
export type FilterStatus = 'all' | 'active' | 'created' | 'disputed' | 'pending' | 'completed';

export function useProjectFilters() {
  const [activeTab, setActiveTab] = useState<UserRole>('kontraktor');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [kontraktorProjects, setKontraktorProjects] = useState<KontraktorProject[]>([]);
  const [kuliProjects, setKuliProjects] = useState<KuliProject[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const [kontraktor, kuli] = await Promise.all([
        fetchKontraktorProjects(),
        fetchKuliProjects(),
      ]);
      setKontraktorProjects(kontraktor);
      setKuliProjects(kuli);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const projects = activeTab === 'kontraktor' ? kontraktorProjects : kuliProjects;

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter((p) => p.status === filter);

  return {
    activeTab,
    setActiveTab,
    filter,
    setFilter,
    loading,
    projects,
    filteredProjects,
  };
}
