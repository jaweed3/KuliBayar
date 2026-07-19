'use client';

import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/config';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import Iconify from '@/components/Iconify';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [proofs, setProofs] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p, d] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`).then(r => r.json()),
        fetch(`${API_BASE}/api/admin/proofs`).then(r => r.json()),
        fetch(`${API_BASE}/api/admin/disputes`).then(r => r.json()),
      ]);
      setStats(s); setProofs(p); setDisputes(d);
    } catch (e) { setActionMsg('Gagal load data admin'); } finally { setLoading(false); }
  };

  const verifyProof = async (id: number, verified: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/proofs/${id}/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      });
      const data = await res.json();
      if (data.success) { setActionMsg(verified ? 'Bukti diverifikasi' : 'Bukti ditolak'); loadData(); }
      else setActionMsg(`Error: ${data.error}`);
    } catch { setActionMsg('Gagal verifikasi bukti'); }
  };

  const resolveDispute = async (id: string, favorKuli: boolean) => {
    const amount = prompt('Amount to release (POL):', '0.01');
    if (!amount) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/disputes/${id}/resolve`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorKuli, amount }),
      });
      const data = await res.json();
      if (data.success) { setActionMsg('Sengketa diselesaikan'); loadData(); }
      else setActionMsg(`Error: ${data.error}`);
    } catch { setActionMsg('Gagal resolve sengketa'); }
  };

  const cancelProject = async (id: number) => {
    if (!confirm(`Cancel project #${id}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/projects/${id}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (data.success) { setActionMsg('Proyek dibatalkan'); loadData(); }
      else setActionMsg(`Error: ${data.error}`);
    } catch { setActionMsg('Gagal batalkan proyek'); }
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      <NavigationBar activeItem="dashboard" />
      <main className="container mx-auto px-6 pt-32">
        <h1 className="text-4xl mb-10 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Panel Admin</h1>

        {actionMsg && (
          <div className="bg-[#FF4500]/10 border border-[#FF4500]/30 text-[#FF4500] px-6 py-3 rounded-2xl mb-8 flex justify-between items-center">
            <span>{actionMsg}</span>
            <button onClick={() => setActionMsg(null)}><Iconify icon="lucide:x" /></button>
          </div>
        )}

        {loading ? (
          <div className="text-gray-500 animate-pulse text-lg">Memuat...</div>
        ) : (
          <>
            {stats && (
              <section className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12">
                {[
                  { label: 'Total Proyek', value: stats.totalProjects, icon: 'lucide:folder' },
                  { label: 'Aktif', value: stats.activeProjects, icon: 'lucide:activity' },
                  { label: 'Pending Proof', value: stats.pendingProofs, icon: 'lucide:image' },
                  { label: 'Sengketa Aktif', value: stats.activeDisputes, icon: 'lucide:alert-triangle' },
                  { label: 'Pembayaran', value: stats.totalPayments, icon: 'lucide:check-circle' },
                  { label: 'Volume (POL)', value: stats.totalVolume, icon: 'lucide:wallet' },
                ].map(s => (
                  <div key={s.label} className="bg-[#111] border border-white/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Iconify icon={s.icon} className="text-[#FF4500] text-sm" />
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest">{s.label}</p>
                    </div>
                    <p className="text-2xl font-mono text-white">{s.value}</p>
                  </div>
                ))}
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Proof Queue */}
              <section className="bg-[#111] border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl mb-6 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Antrian Verifikasi Bukti
                  {proofs.length > 0 && <span className="ml-2 text-[10px] text-[#FF4500] font-mono">({proofs.length})</span>}
                </h2>
                {proofs.length === 0 ? (
                  <p className="text-gray-500 italic">Tidak ada bukti yang perlu diverifikasi</p>
                ) : (
                  <div className="space-y-4">
                    {proofs.map(p => (
                      <div key={p.id} className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-white font-bold">{p.projectName}</p>
                            <p className="text-gray-500 text-xs">Proof #{p.id} • {new Date(p.timestamp).toLocaleDateString('id-ID')}</p>
                          </div>
                          <Iconify icon="lucide:loader-2" className="text-yellow-500 animate-spin" />
                        </div>
                        {p.photoHash && <p className="text-[10px] text-gray-600 font-mono mb-3">{p.photoHash}</p>}
                        {p.latitude && p.longitude && (
                          <p className="text-[10px] text-gray-600 font-mono mb-3">📍 {p.latitude}, {p.longitude}</p>
                        )}
                        <div className="flex gap-3">
                          <button onClick={() => verifyProof(p.id, true)} className="flex-1 py-2 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-green-500/20 transition-all">Setuju</button>
                          <button onClick={() => verifyProof(p.id, false)} className="flex-1 py-2 bg-red-500/10 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all">Tolak</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Active Disputes */}
              <section className="bg-[#111] border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl mb-6 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Sengketa Aktif
                  {disputes.length > 0 && <span className="ml-2 text-[10px] text-red-500 font-mono">({disputes.length})</span>}
                </h2>
                {disputes.length === 0 ? (
                  <p className="text-gray-500 italic">Tidak ada sengketa aktif</p>
                ) : (
                  <div className="space-y-4">
                    {disputes.map(d => (
                      <div key={d.id} className="bg-[#1a1a1a] rounded-2xl p-5 border border-red-500/10">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-white font-bold">{d.projectName}</p>
                            <p className="text-gray-500 text-xs">{d.id} • {d.date}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 uppercase font-bold border border-red-500/20">Sengketa</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2"><span className="text-gray-500">Alasan:</span> {d.reason}</p>
                        <p className="text-[10px] text-gray-600 mb-4">Diajukan oleh: {d.raisedBy}</p>
                        <div className="flex gap-3">
                          <button onClick={() => resolveDispute(d.id, true)} className="flex-1 py-2 bg-[#FF4500]/10 text-[#FF4500] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#FF4500]/20 transition-all">Favor Kuli</button>
                          <button onClick={() => resolveDispute(d.id, false)} className="flex-1 py-2 bg-gray-500/10 text-gray-400 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-500/20 transition-all">Favor Kontraktor</button>
                        </div>
                        <button onClick={() => cancelProject(d.projectId)} className="mt-2 w-full py-2 bg-red-500/5 text-red-500/50 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/10 hover:text-red-500 transition-all">
                          Batalkan Proyek #{d.projectId}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
      <div className="mt-20"><Footer /></div>
    </div>
  );
}
