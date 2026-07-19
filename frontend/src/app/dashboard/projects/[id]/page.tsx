'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import { API_BASE } from '@/lib/config';
import Iconify from '@/components/Iconify';

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/projects/${id}`)
      .then(r => r.json())
      .then(setProject)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const progress = project ? (Number(project.daysCompleted) / Number(project.durationDays)) * 100 : 0;
  const workProofs: any[] = [];
  const paymentHistory: any[] = [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-gray-500 text-lg animate-pulse">Memuat...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-gray-500 text-lg">Proyek tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20 relative">
      <NavigationBar activeItem="dashboard" />

      <main className="container mx-auto px-6 pt-32">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-gray-500 font-medium">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-400">Proyek</span>
          <span className="mx-2">/</span>
          <span className="text-white">Project #{id}</span>
        </nav>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="status-badge bg-[#FF4500] text-white">{project.status}</span>
              <span className="text-gray-500 text-sm font-mono tracking-tighter">ID: KB-{String(8000 + Number(project.id)).padStart(4, '0')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              {project.name || `Project #${project.id}`}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-400">
              {project.location && (
                <div className="flex items-center gap-2">
                  <Iconify icon="lucide:map-pin" className="text-[#FF4500]" />
                  <span>{project.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-3 rounded-full border border-white/10 hover:bg-white/5 transition-all text-white">
              <Iconify icon="lucide:download" className="text-xl" />
            </button>
            <a href="#" className="px-6 py-3 rounded-full border border-white/10 text-sm font-medium hover:bg-white/5 transition-all">
              Lihat On-Chain
            </a>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Total Budget</p>
            <p className="text-2xl font-mono text-white">{project.totalAmount || '0'} <span className="text-gray-500 text-sm">POL</span></p>
          </div>
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Tarif Harian</p>
            <p className="text-2xl font-mono text-white">{project.dailyRate || '0'} <span className="text-gray-500 text-sm">POL</span></p>
          </div>
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Durasi</p>
            <p className="text-2xl font-mono text-white">{project.durationDays || '0'} <span className="text-gray-500 text-sm">Hari</span></p>
          </div>
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <Iconify icon="lucide:check-circle-2" className="text-4xl text-[#FF4500]" />
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Progress</p>
            <p className="text-2xl font-mono text-white">{project.daysCompleted || '0'} / {project.durationDays || '0'} <span className="text-gray-500 text-sm">Hari</span></p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Escrow Status */}
            <section className="bg-[#FF4500] rounded-3xl p-8 md:p-10">
              <div className="flex items-start justify-between mb-8">
                <div className="text-black">
                  <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Status Escrow</h2>
                  <p className="text-black/60 font-medium">Dana Tersimpan Aman di Protokol</p>
                </div>
                <Iconify icon="lucide:shield-check" className="text-4xl text-black/40" />
              </div>

              <div className="mb-8">
                <div className="flex justify-between text-sm font-bold text-black mb-2 uppercase tracking-wide">
                  <span>Locked Funds ({project.totalAmount || '0'} POL)</span>
                  <span>{progress.toFixed(0)}% Released</span>
                </div>
                <div className="h-4 w-full bg-black/10 rounded-full overflow-hidden border border-black/5">
                  <div className="h-full bg-black" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-black">
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest mb-1 opacity-60">Sudah Cair</p>
                  <p className="text-2xl font-mono font-bold">{project.totalReleased || '0'} POL</p>
                </div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest mb-1 opacity-60">Sisa Saldo</p>
                  <p className="text-2xl font-mono font-bold">{((Number(project.totalAmount) || 0) - (Number(project.totalReleased) || 0)).toFixed(3)} POL</p>
                </div>
              </div>
            </section>

            {/* Participants */}
            <section className="bg-[#111] border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Partisipan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#FF4500] mb-3">Kontraktor</p>
                  <code className="text-sm text-gray-400">{project.kontraktor}</code>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#FF4500] mb-3">Kuli</p>
                  <code className="text-sm text-gray-400">{project.kuli}</code>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8">
              <h4 className="text-xl mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Aksi Cepat</h4>
              <div className="space-y-4">
                {project.status === 'Active' && (
                  <button className="w-full py-4 bg-[#FF4500] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#e63e00] transition-all btn-glow">
                    Cairkan Dana Manual
                  </button>
                )}
                <a href="/dashboard/disputes" className="block w-full py-4 bg-transparent border border-red-500/30 text-red-500 rounded-full font-bold uppercase tracking-widest text-xs text-center hover:bg-red-500/5 transition-all">
                  Ajukan Dispute
                </a>
              </div>
              <p className="mt-6 text-[10px] text-gray-500 text-center uppercase tracking-widest leading-relaxed">
                Semua transaksi diverifikasi secara kriptografis pada smart contract.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
