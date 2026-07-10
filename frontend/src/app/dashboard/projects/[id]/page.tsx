'use client';

import { useState, useEffect, use } from 'react';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';

import Iconify from '@/components/Iconify';

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Mock project data - in production, fetch from API
  const project = {
    id: parseInt(id),
    name: 'Renovasi Gedung Kantor',
    subtitle: 'PT XYZ',
    location: 'Jakarta Selatan, Indonesia',
    dateRange: '15 Jan - 20 Jan 2024',
    status: 'active',
    totalBudget: '0.05',
    dailyRate: '0.01',
    durationDays: 5,
    daysCompleted: 2,
    releasedAmount: '0.02',
    remainingAmount: '0.03',
    contractAddress: '0x1234...5678',
    kontraktor: { name: 'Budi Santoso', address: '0xabcd...ef12', phone: '+62 812 345 678' },
    kuli: { name: 'Ahmad Wijaya', address: '0x5678...abcd', rating: 4.5, onTimeRate: '92%', reliability: 'High' },
  };

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
    return () => observer.disconnect();
  }, []);

  const workProofs = [
    { day: 1, date: '15 Jan 2024', status: 'verified', time: '08:15 WIB', gps: '-6.2088, 106.8456', amount: '0.01 ETH' },
    { day: 2, date: '16 Jan 2024', status: 'pending', time: null, gps: null, amount: '0.01 ETH' },
  ];

  const paymentHistory = [
    { day: 'Day 1', date: '15 Jan 2024', status: 'success', amount: '0.01 ETH', txHash: '0x7f3...8a21' },
    { day: 'Day 2', date: '16 Jan 2024', status: 'pending', amount: '--', txHash: 'Pending verification' },
  ];

  const progress = (project.daysCompleted / project.durationDays) * 100;

  return (
    <div className="min-h-screen bg-[#050505] pb-20 relative">
      <NavigationBar activeItem="dashboard" />

      <main className="container mx-auto px-6 pt-32">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-gray-500 font-medium">
          <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
          <span className="mx-2">/</span>
          <span className="text-gray-400">Proyek</span>
          <span className="mx-2">/</span>
          <span className="text-white">Project #{id}</span>
        </nav>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 reveal">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="status-badge bg-[#FF4500] text-white">Active</span>
              <span className="text-gray-500 text-sm font-mono tracking-tighter">ID: KB-2024-{String(project.id).padStart(3, '0')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              {project.name} <span className="italic font-light">{project.subtitle}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Iconify icon="lucide:map-pin" className="text-[#FF4500]" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Iconify icon="lucide:calendar" className="text-[#FF4500]" />
                <span>{project.dateRange}</span>
              </div>
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
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 reveal" style={{ transitionDelay: '100ms' }}>
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Total Budget</p>
            <p className="text-2xl font-mono text-white">{project.totalBudget} <span className="text-gray-500 text-sm">ETH</span></p>
          </div>
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Tarif Harian</p>
            <p className="text-2xl font-mono text-white">{project.dailyRate} <span className="text-gray-500 text-sm">ETH</span></p>
          </div>
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Durasi</p>
            <p className="text-2xl font-mono text-white">{project.durationDays} <span className="text-gray-500 text-sm">Hari</span></p>
          </div>
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <Iconify icon="lucide:check-circle-2" className="text-4xl text-[#FF4500]" />
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Progress</p>
            <p className="text-2xl font-mono text-white">{project.daysCompleted} / {project.durationDays} <span className="text-gray-500 text-sm">Hari</span></p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Escrow Status */}
            <section className="bg-[#FF4500] rounded-3xl p-8 md:p-10 reveal" style={{ transitionDelay: '200ms' }}>
              <div className="flex items-start justify-between mb-8">
                <div className="text-black">
                  <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Status Escrow</h2>
                  <p className="text-black/60 font-medium">Dana Tersimpan Aman di Protokol</p>
                </div>
                <Iconify icon="lucide:shield-check" className="text-4xl text-black/40" />
              </div>

              <div className="mb-8">
                <div className="flex justify-between text-sm font-bold text-black mb-2 uppercase tracking-wide">
                  <span>Locked Funds ({project.totalBudget} ETH)</span>
                  <span>{progress}% Released</span>
                </div>
                <div className="h-4 w-full bg-black/10 rounded-full overflow-hidden border border-black/5">
                  <div className="h-full bg-black" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-black">
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest mb-1 opacity-60">Sudah Cair</p>
                  <p className="text-2xl font-mono font-bold">{project.releasedAmount} ETH</p>
                </div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest mb-1 opacity-60">Sisa Saldo</p>
                  <p className="text-2xl font-mono font-bold">{project.remainingAmount} ETH</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-black/10 flex items-center justify-between">
                <div className="text-black">
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Smart Contract</p>
                  <code className="text-sm font-mono">{project.contractAddress}</code>
                </div>
                <Iconify icon="lucide:external-link" className="text-black/60 cursor-pointer hover:text-black transition-colors" />
              </div>
            </section>

            {/* Work Proofs Timeline */}
            <section className="reveal" style={{ transitionDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl italic" style={{ fontFamily: "'Playfair Display', serif" }}>Riwayat Pekerjaan</h3>
                <span className="text-xs uppercase tracking-widest text-gray-500 font-mono">Updated: 2h ago</span>
              </div>

              <div className="space-y-4">
                {workProofs.map((proof) => (
                  <div
                    key={proof.day}
                    className={`bg-[#111] border rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 ${
                      proof.status === 'pending' ? 'border-[#FF4500]/30 relative overflow-hidden' : 'border-white/10'
                    }`}
                  >
                    {proof.status === 'pending' && <div className="absolute top-0 right-0 w-1 h-full bg-[#FF4500]" />}

                    <div className="flex-shrink-0 w-24 h-24 bg-[#1a1a1a] rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                      {proof.status === 'verified' ? (
                        <img src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=200" alt={`Day ${proof.day}`} className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <Iconify icon="lucide:loader-2" className="text-4xl text-gray-700 animate-spin" />
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-white">Hari {proof.day}</h4>
                        <span className="text-gray-500 font-mono text-xs">{proof.date}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border tracking-tighter ${
                          proof.status === 'verified'
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {proof.status === 'verified' ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      {proof.gps ? (
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Iconify icon="lucide:map-pin" className="text-[#FF4500]" />
                            <span>{proof.gps}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Iconify icon="lucide:clock" className="text-[#FF4500]" />
                            <span>{proof.time}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Menunggu verifikasi admin / AI Oracle...</p>
                      )}
                    </div>

                    <div className="text-right md:border-l border-white/10 md:pl-8">
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">
                        {proof.status === 'verified' ? 'Released' : 'In Escrow'}
                      </p>
                      <p className={`text-lg font-mono ${proof.status === 'verified' ? 'text-white' : 'text-gray-400 italic'}`}>
                        {proof.amount}
                      </p>
                    </div>
                  </div>
                ))}

                {project.daysCompleted < project.durationDays && (
                  <div className="border border-dashed border-white/10 rounded-2xl p-6 flex items-center justify-center">
                    <span className="text-gray-700 text-sm uppercase tracking-widest font-bold">
                      Hari {project.daysCompleted + 1} - {project.durationDays} Belum Dimulai
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 reveal" style={{ transitionDelay: '400ms' }}>
              <h4 className="text-xl mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Aksi Cepat</h4>

              <div className="space-y-4">
                <button className="w-full py-4 bg-[#FF4500] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#e63e00] transition-all btn-glow">
                  Cairkan Dana Manual
                </button>
                <button className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                  Lihat Laporan Lengkap
                </button>
                <a href="/dashboard/disputes" className="block w-full py-4 bg-transparent border border-red-500/30 text-red-500 rounded-full font-bold uppercase tracking-widest text-xs text-center hover:bg-red-500/5 transition-all">
                  Ajukan Dispute
                </a>
              </div>

              <p className="mt-6 text-[10px] text-gray-500 text-center uppercase tracking-widest leading-relaxed">
                Semua transaksi diverifikasi secara kriptografis pada smart contract.
              </p>
            </div>

            {/* Participants */}
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 reveal" style={{ transitionDelay: '500ms' }}>
              <h4 className="text-xl mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Partisipan</h4>

              <div className="space-y-10">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#FF4500] mb-4">Kontraktor</p>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF4500] to-orange-300 flex items-center justify-center text-black font-bold text-sm">
                      BS
                    </div>
                    <div>
                      <p className="font-bold text-sm">{project.kontraktor.name}</p>
                      <code className="text-[10px] text-gray-500">{project.kontraktor.address}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Iconify icon="lucide:phone" className="text-[#FF4500]" />
                    <span>{project.kontraktor.phone}</span>
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#FF4500] mb-4">Kuli Pekerja</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#222] border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                      AW
                    </div>
                    <div>
                      <p className="font-bold text-sm">{project.kuli.name}</p>
                      <code className="text-[10px] text-gray-500">{project.kuli.address}</code>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Reputasi</span>
                      <span className="text-[#FF4500] font-bold">{project.kuli.rating} ⭐</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">On-Time Rate</span>
                      <span className="text-white">{project.kuli.onTimeRate}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Reliability Index</span>
                      <span className="text-green-500">{project.kuli.reliability}</span>
                    </div>
                  </div>
                  <a href="/dashboard/reputation" className="mt-4 block text-center py-2 text-[10px] uppercase font-bold tracking-widest text-gray-400 border border-white/5 rounded-lg hover:bg-white/5 transition-all">
                    Lihat Detail Reputasi
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Payment History */}
        <section className="mt-20 reveal" style={{ transitionDelay: '600ms' }}>
          <h3 className="text-3xl mb-8 italic text-white/40" style={{ fontFamily: "'Playfair Display', serif" }}>Riwayat Pembayaran</h3>
          <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                    <th className="px-8 py-6">Hari</th>
                    <th className="px-8 py-6">Tanggal</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6">Amount</th>
                    <th className="px-8 py-6">TX Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paymentHistory.map((tx, i) => (
                    <tr key={i} className={`group hover:bg-white/[0.02] transition-colors ${tx.status !== 'success' ? 'text-gray-700' : ''}`}>
                      <td className="px-8 py-6 text-sm font-bold">{tx.day}</td>
                      <td className="px-8 py-6 text-sm text-gray-400">{tx.date}</td>
                      <td className="px-8 py-6">
                        <span className={`flex items-center gap-2 text-xs font-bold ${
                          tx.status === 'success' ? 'text-green-500' : 'text-gray-700'
                        }`}>
                          <Iconify icon={tx.status === 'success' ? 'lucide:check-circle' : 'lucide:timer'} />
                          {tx.status === 'success' ? 'Success' : 'In Progress'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm font-mono">{tx.amount}</td>
                      <td className={`px-8 py-6 text-sm font-mono ${tx.status === 'success' ? 'text-gray-600 group-hover:text-gray-400 transition-colors' : 'italic opacity-30'}`}>
                        {tx.txHash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
