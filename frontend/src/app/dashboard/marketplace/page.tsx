'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import Iconify from '@/components/Iconify';
import { useAuth } from '@/lib/auth';
import { authFetch } from '@/lib/authFetch';

export default function MarketplacePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const { address } = useAuth();

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/projects/open');
      const data = await res.json();
      setProjects(data);
    } catch { setMsg('Gagal memuat proyek'); } finally { setLoading(false); }
  };

  const handleApply = async (id: number) => {
    setApplying(id);
    try {
      const res = await authFetch(`/api/projects/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: address?.slice(0, 8) }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('Berhasil mendaftar! Tunggu konfirmasi kontraktor.');
        loadProjects();
      } else setMsg(`Error: ${data.error}`);
    } catch { setMsg('Gagal mendaftar'); } finally { setApplying(null); }
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      <NavigationBar activeItem="marketplace" />
      <main className="container mx-auto px-6 pt-32">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Marketplace</h1>
            <p className="text-gray-500 mt-1">Cari proyek yang cocok untuk kamu</p>
          </div>
          <button onClick={loadProjects} className="p-3 rounded-full border border-white/10 hover:bg-white/5 transition-all text-gray-400">
            <Iconify icon="lucide:refresh-cw" className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {msg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-6 py-3 rounded-2xl mb-8 flex justify-between items-center">
            <span>{msg}</span>
            <button onClick={() => setMsg(null)}><Iconify icon="lucide:x" /></button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#111] border border-white/5 rounded-3xl p-8 animate-pulse">
                <div className="h-6 bg-white/5 rounded-full w-2/3 mb-4" />
                <div className="h-4 bg-white/5 rounded-full w-1/2 mb-6" />
                <div className="h-4 bg-white/5 rounded-full w-full mb-2" />
                <div className="h-4 bg-white/5 rounded-full w-3/4" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <Iconify icon="lucide:package-open" className="text-6xl text-gray-800 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Belum ada proyek terbuka</p>
            <p className="text-gray-600 text-sm mt-2">Kontraktor belum membuat proyek baru</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
              <div key={p.id} className="bg-[#111] border border-white/10 rounded-3xl p-8 hover:border-[#FF4500]/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl text-white font-bold mb-1">{p.name}</h3>
                    <p className="text-gray-500 text-xs font-mono">#KB-{String(8000 + p.id)}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 uppercase font-bold border border-green-500/20">Open</span>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <Iconify icon="lucide:map-pin" className="text-[#FF4500] text-xs" />
                  <span>{p.location || 'Lokasi tidak ditentukan'}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-[#1a1a1a] rounded-2xl">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Tarif</p>
                    <p className="font-mono text-white text-sm">{p.dailyRate} POL</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Durasi</p>
                    <p className="font-mono text-white text-sm">{p.durationDays} hari</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total</p>
                    <p className="font-mono text-white text-sm">{p.totalAmount || (Number(p.dailyRate) * Number(p.durationDays)).toFixed(3)} POL</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href={`/dashboard/projects/${p.id}`} className="flex-1 py-3 border border-white/10 text-gray-400 rounded-full text-xs font-bold uppercase tracking-wider text-center hover:bg-white/5 transition-all">
                    Detail
                  </Link>
                  <button
                    onClick={() => handleApply(p.id)}
                    disabled={applying === p.id}
                    className="flex-1 py-3 bg-[#FF4500] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#e63e00] transition-all btn-glow disabled:opacity-50"
                  >
                    {applying === p.id ? '...' : 'Daftar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <div className="mt-20"><Footer /></div>
    </div>
  );
}
