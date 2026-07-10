// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'kontraktor' | 'kuli'>('kontraktor');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock projects
  const kontraktorProjects = [
    { id: 1, name: 'Pondasi Gudang Logistik', location: 'Cikarang, Bekasi', status: 'active', statusLabel: 'Aktif', daysCompleted: 3, durationDays: 10, totalAmount: '0.100', releasedAmount: '0.030', kbId: '#KB-8921' },
    { id: 2, name: 'Renovasi Ruko Blok A', location: 'Tebet, Jakarta', status: 'created', statusLabel: 'Created', daysCompleted: 0, durationDays: 5, totalAmount: '0.000', releasedAmount: '0.000', kbId: '#KB-8940' },
    { id: 3, name: 'Pemasangan Keramik Lt 2', location: 'Bintaro, Tangsel', status: 'disputed', statusLabel: 'Sengketa', daysCompleted: 8, durationDays: 12, totalAmount: '0.060', releasedAmount: '0.036', kbId: '#KB-8711' },
  ];

  const kuliProjects = [
    { id: 1, name: 'Pondasi Gudang Logistik', location: 'Cikarang, Bekasi', status: 'active', statusLabel: 'Aktif', daysCompleted: 3, durationDays: 10, dailyRate: '0.010', earned: '0.030', kontraktor: 'Budi S.' },
    { id: 2, name: 'Renovasi Ruko Blok A', location: 'Tebet, Jakarta', status: 'active', statusLabel: 'Aktif', daysCompleted: 1, durationDays: 5, dailyRate: '0.015', earned: '0.015', kontraktor: 'Ahmad W.' },
    { id: 3, name: 'Pemasangan Keramik Lt 2', location: 'Bintaro, Tangsel', status: 'pending', statusLabel: 'Menunggu', daysCompleted: 0, durationDays: 12, dailyRate: '0.008', earned: '0.000', kontraktor: 'Dewi L.' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => observer.disconnect();
  }, []);

  // Re-observe when loading finishes (cards appear after async load)
  useEffect(() => {
    if (!loading) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add('active');
          });
        },
        { threshold: 0.1 }
      );
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }
  }, [loading]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'created': return 'bg-[#FF4500]/10 text-[#FF4500] border-[#FF4500]/20';
      case 'disputed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  const projects = activeTab === 'kontraktor' ? kontraktorProjects : kuliProjects;
  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  return (
    <div className="min-h-screen bg-[#050505]">
      <NavigationBar activeItem="projects" />

      <main className="container mx-auto px-6 pt-40 pb-20 relative z-10">
        <header className="mb-12 reveal">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Dashboard Proyek
              </h1>
              <p className="text-gray-400 max-w-xl">Kelola proyek konstruksi Anda secara on-chain. Pantau escrow dan kirim bukti kerja harian.</p>
            </div>
            {activeTab === 'kontraktor' && (
              <a href="/dashboard/projects/create" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF4500] text-white font-medium hover:bg-[#e63e00] transition-colors">
                <iconify-icon icon="lucide:plus" />
                <span>Buat Proyek</span>
              </a>
            )}
            {activeTab === 'kuli' && (
              <a href="/dashboard/proofs" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF4500] text-white font-medium hover:bg-[#e63e00] transition-colors">
                <iconify-icon icon="lucide:camera" />
                <span>Kirim Bukti</span>
              </a>
            )}
          </div>
        </header>

        {/* Role Toggle */}
        <div className="flex items-center gap-2 mb-8 reveal" style={{ transitionDelay: '50ms' }}>
          <div className="bg-[#111] border border-white/10 rounded-full p-1 flex">
            <button
              onClick={() => setActiveTab('kontraktor')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'kontraktor' ? 'bg-[#FF4500] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Kontraktor
            </button>
            <button
              onClick={() => setActiveTab('kuli')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'kuli' ? 'bg-[#FF4500] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Kuli
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10 reveal" style={{ transitionDelay: '100ms' }}>
          {[{ key: 'all', label: 'Semua' }, { key: 'active', label: 'Aktif' }, { key: 'completed', label: 'Selesai' }, { key: 'disputed', label: 'Sengketa' }].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${filter === f.key ? 'bg-[#FF4500] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#111] border border-white/10 rounded-3xl p-8 animate-pulse">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-6 w-20 bg-white/5 rounded-full" />
                  <div className="h-4 w-16 bg-white/5 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-white/5 rounded mb-2" />
                <div className="h-4 w-1/2 bg-white/5 rounded mb-6" />
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <div className="h-3 w-20 bg-white/5 rounded" />
                    <div className="h-3 w-12 bg-white/5 rounded" />
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="h-16 bg-white/5 rounded-2xl" />
                  <div className="h-16 bg-white/5 rounded-2xl" />
                </div>
                <div className="h-12 bg-white/5 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Tidak ada proyek ditemukan</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal" style={{ transitionDelay: '200ms' }}>
            {filteredProjects.map((project) => {
              const progress = project.durationDays > 0 ? (project.daysCompleted / project.durationDays) * 100 : 0;
              return (
                <div key={project.id} className="project-card bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${getStatusStyle(project.status)}`}>
                        {project.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                        {project.status === 'disputed' && <iconify-icon icon="lucide:alert-circle" class="text-sm" />}
                        {project.statusLabel}
                      </span>
                      <span className="text-xs text-white/40 font-mono">{'kbId' in project ? project.kbId : `ID: ${project.id}`}</span>
                    </div>

                    <h3 className="text-xl font-semibold mb-2 group-hover:text-[#FF4500] transition-colors">{project.name}</h3>
                    <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                      <iconify-icon icon="lucide:map-pin" class="text-gray-600" />
                      {project.location}
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500 uppercase tracking-widest font-bold">Progres Hari</span>
                        <span className="text-white">{project.daysCompleted} / {project.durationDays}</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF4500] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {activeTab === 'kontraktor' ? (
                        <>
                          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Dana Terkunci</p>
                            <p className="text-sm font-medium">{(project as any).totalAmount} ETH</p>
                          </div>
                          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Dana Dirilis</p>
                            <p className="text-sm font-medium">{(project as any).releasedAmount} ETH</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Tarif/Hari</p>
                            <p className="text-sm font-mono">{(project as any).dailyRate} ETH</p>
                          </div>
                          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Earned</p>
                            <p className="text-sm font-mono text-green-500">{(project as any).earned} ETH</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {activeTab === 'kontraktor' ? (
                      <>
                        {project.status === 'active' && (
                          <a href="/dashboard/proofs" className="w-full py-3 rounded-xl bg-white text-black text-center text-sm font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                            <iconify-icon icon="lucide:camera" /> Kirim Bukti Kerja
                          </a>
                        )}
                        {project.status === 'created' && (
                          <a href={`/dashboard/projects/${project.id}/fund`} className="w-full py-3 rounded-xl bg-[#FF4500] text-white text-center text-sm font-bold hover:bg-[#e63e00] transition-colors flex items-center justify-center gap-2">
                            <iconify-icon icon="lucide:wallet" /> Fund Escrow
                          </a>
                        )}
                        {project.status === 'disputed' && (
                          <a href="/dashboard/disputes" className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center text-sm font-bold hover:bg-red-500/20 transition-colors">
                            Buka Sengketa
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        {project.status === 'active' && (
                          <a href="/dashboard/proofs" className="w-full py-3 rounded-xl bg-[#FF4500] text-white text-center text-sm font-bold hover:bg-[#e63e00] transition-colors flex items-center justify-center gap-2">
                            <iconify-icon icon="lucide:camera" /> Kirim Bukti Kerja
                          </a>
                        )}
                        {project.status === 'pending' && (
                          <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-center text-sm font-medium">
                            Menunggu Persetujuan
                          </div>
                        )}
                      </>
                    )}
                    <a href={`/dashboard/projects/${project.id}`} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-sm font-medium hover:bg-white/10 transition-colors">
                      Lihat Detail
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
