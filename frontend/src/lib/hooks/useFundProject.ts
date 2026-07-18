import { useState, useEffect } from 'react';
import { FundProject, fetchFundProject } from '@/lib/mock/fund';

export function useFundProject(id: string) {
  const [project, setProject] = useState<FundProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [funded, setFunded] = useState(false);
  const [funding, setFunding] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await fetchFundProject(parseInt(id));
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFund = async () => {
    if (!project) return;
    setFunding(true);
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setFunding(false);
    setFunded(true);
  };

  return {
    project,
    loading,
    funded,
    funding,
    handleFund,
  };
}
