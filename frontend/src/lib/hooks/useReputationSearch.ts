import { useState, useEffect } from 'react';
import { MockProfile, fetchRecentProfiles } from '@/lib/mock/profiles';
import { Profile } from '@/types/models';
import { API_BASE } from '@/lib/config';

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
