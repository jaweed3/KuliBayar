import { useState, useEffect, useCallback } from 'react';
import { DisputeHistory, fetchDisputeHistory } from '@/lib/mock/disputes';
import { API_BASE } from '@/lib/config';

interface ActiveDispute {
  id: string;
  reason: string;
  date: string;
  status: string;
}

export function useDisputes() {
  const [form, setForm] = useState({ projectId: '', reason: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [bannerType, setBannerType] = useState<'success' | 'error'>('success');
  const [activeDispute, setActiveDispute] = useState<ActiveDispute | null>(null);
  const [history, setHistory] = useState<DisputeHistory[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await fetchDisputeHistory();
    setHistory(data);
  };

  const dismissBanner = useCallback(() => {
    setResult(null);
  }, []);

  const canSubmit = form.projectId && form.reason && form.description.length >= 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/projects/${form.projectId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: form.reason }),
      });
      const data = await res.json();
      if (data.success) {
        setResult('Laporan sengketa berhasil terkirim. Admin akan meninjau dalam 24 jam.');
        setBannerType('success');
        setActiveDispute({
          id: `DISP-${Date.now().toString().slice(-4)}`,
          reason: form.reason,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: 'reviewing',
        });
        setForm({ projectId: '', reason: '', description: '' });
      } else {
        setResult(`Error: ${data.error || 'Unknown error'}`);
        setBannerType('error');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setResult(`Gagal: ${message}`);
      setBannerType('error');
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    loading,
    result,
    bannerType,
    activeDispute,
    history,
    canSubmit,
    dismissBanner,
    handleSubmit,
  };
}
