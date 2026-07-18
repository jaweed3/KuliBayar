import { useState, useEffect } from 'react';
import { MyWorkProject, fetchMyWorkProjects } from '@/lib/mock/mywork';

export function useMyWork() {
  const [projects, setProjects] = useState<MyWorkProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchMyWorkProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load my work projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = projects.filter((p) => p.status === 'active').length;
  const totalEarned = projects.reduce((sum, p) => sum + parseFloat(p.totalEarned), 0);

  return {
    projects,
    loading,
    activeCount,
    totalEarned,
  };
}
