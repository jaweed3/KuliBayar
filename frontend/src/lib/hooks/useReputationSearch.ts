import { useState, useEffect } from 'react';
import { MockProfile, fetchRecentProfiles } from '@/lib/mock/profiles';
import { Profile } from '@/types/models';
import { API_BASE } from '@/lib/config';
import { USE_MOCK_DATA } from '@/lib/mock/projects';

export function useReputationSearch() {
  const [address, setAddress] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentProfiles, setRecentProfiles] = useState<MockProfile[]>([]);

  useEffect(() => {
    loadRecentProfiles();
  }, []);

  const loadRecentProfiles = async () => {
    const profiles = await fetchRecentProfiles();
    setRecentProfiles(profiles);
  };

  const fetchProfile = async (searchAddress?: string) => {
    const targetAddress = searchAddress || address;
    if (!targetAddress) return;

    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      if (USE_MOCK_DATA) {
        // Mock: find in recent profiles or return null
        await new Promise((resolve) => setTimeout(resolve, 300));
        const found = recentProfiles.find((p) => p.address === targetAddress || p.shortAddress === targetAddress);
        if (found) {
          setProfile({
            id: '1',
            user: found.address,
            role: found.role === 'Kuli' ? '0' : '1',
            rating: found.rating.toString(),
            totalJobs: found.jobs.toString(),
            onTimePayments: Math.floor(found.jobs * 0.8).toString(),
            disputes: Math.floor(Math.random() * 3).toString(),
            totalEarnings: (found.jobs * 0.01).toFixed(3),
            createdAt: Date.now().toString(),
            exists: true,
          });
        }
        return;
      }

      const res = await fetch(`${API_BASE}/api/reputation/address/${targetAddress}`);
      const data = await res.json();
      if (data.profileId && data.profileId !== '0') {
        const profileRes = await fetch(`${API_BASE}/api/reputation/${data.profileId}`);
        setProfile(await profileRes.json());
      } else {
        setProfile(null);
      }
    } catch (err) {
      setError('Gagal mengambil data - pastikan backend berjalan');
    } finally {
      setLoading(false);
    }
  };

  return {
    address,
    setAddress,
    profile,
    loading,
    error,
    recentProfiles,
    fetchProfile,
  };
}
