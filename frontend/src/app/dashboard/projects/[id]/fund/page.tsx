'use client';

import { use } from 'react';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import { useFundProject } from '@/lib/hooks/useFundProject';
import { useRevealAnimation } from '@/lib/hooks/useRevealAnimation';

import Iconify from '@/components/Iconify';

export default function FundEscrow({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { project, loading, funded, funding, handleFund } = useFundProject(id);
  useRevealAnimation([loading, funded]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col">
        <NavigationBar activeItem="dashboard" />
        <main className="flex-1 pt-32 pb-20 flex items-center justify-center">
          <div className="text-gray-500">Memuat data proyek...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col">
        <NavigationBar activeItem="dashboard" />
        <main className="flex-1 pt-32 pb-20 flex items-center justify-center">
          <div className="text-gray-500">Proyek tidak ditemukan</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <NavigationBar activeItem="dashboard" />

      <main className="flex-1 pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="reveal active">
              <span className="text-[#FF4500] text-sm uppercase tracking-widest font-mono mb-2 block">Step 2/4</span>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Konfirmasi <br />
                <span className="italic font-light">Dana Escrow</span>
              </h1>
            </div>
            <div className="reveal active flex items-center gap-2 text-gray-500 text-sm">
              <Iconify icon="lucide:lock" className="text-lg" />
              <span>Smart Contract Secure</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            {/* Project Summary */}
            <div className="reveal active bg-[#111] border border-white/5 rounded-3xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Nama Proyek</label>
                    <div className="text-xl font-medium">{project.name}</div>
                    <div className="text-xs text-gray-600 mt-1">Project ID: KB-2024-{String(project.id).padStart(4, '0')}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Lokasi Kerja</label>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Iconify icon="lucide:map-pin" className="text-[#FF4500]" />
                      <span>{project.location}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Wallet Kontraktor</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-white/5 px-2 py-1 rounded text-xs font-mono text-gray-400">{project.kontraktor}</code>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Wallet Kuli</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-white/5 px-2 py-1 rounded text-xs font-mono text-gray-400">{project.kuli}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="reveal active bg-white/5 rounded-3xl p-8 border border-white/5">
              <h3 className="text-lg italic mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Rincian Pembayaran</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <Iconify icon="lucide:calendar" className="text-gray-400" />
                    </div>
                    <span className="text-gray-400">Durasi Kerja</span>
                  </div>
                  <span className="font-medium">{project.durationDays} Hari</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <Iconify icon="lucide:banknote" className="text-gray-400" />
                    </div>
                    <span className="text-gray-400">Tarif Harian (ETH)</span>
                  </div>
                  <span className="font-mono">{project.dailyRate.toFixed(4)} ETH</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="ml-11">Subtotal</span>
                  </div>
                  <span className="font-mono">{project.totalAmount.toFixed(4)} ETH</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <Iconify icon="lucide:zap" className="text-gray-400" />
                    </div>
                    <span className="text-gray-400">Estimasi Biaya Gas (Network)</span>
                  </div>
                  <span className="font-mono text-gray-500">~{project.gasEstimate.toFixed(4)} ETH</span>
                </div>

                <div className="flex justify-between items-center pt-8 pb-4">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-gray-500 font-mono">Total Locked Amount</span>
                    <span className="text-sm text-gray-600">Dana akan dikunci di Escrow</span>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl md:text-5xl font-mono text-[#FF4500] font-medium tracking-tighter">
                      {(project.totalAmount + project.gasEstimate).toFixed(4)} ETH
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="reveal active flex items-start gap-4 p-6 rounded-2xl bg-[#FF4500]/5 border border-[#FF4500]/20">
              <Iconify icon="lucide:info" className="text-[#FF4500] text-2xl shrink-0" />
              <p className="text-sm text-gray-300 leading-relaxed">
                <strong>Perhatian:</strong> Dana ini akan dikunci di Smart Contract KuliBayar. Dana hanya dapat dicairkan secara bertahap kepada Kuli setelah bukti kerja (Foto & GPS) diverifikasi oleh sistem. Kontraktor tidak dapat menarik kembali dana setelah proyek dimulai tanpa proses sengketa.
              </p>
            </div>

            {/* Actions */}
            {!funded ? (
              <div className="reveal active pt-8 flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleFund}
                  disabled={funding}
                  className="flex-1 inline-flex items-center justify-center px-8 py-5 rounded-full text-lg font-medium bg-[#FF4500] text-white hover:scale-[1.02] hover:bg-[#e63e00] transition-all duration-300 shadow-[0_10px_30px_rgba(255,69,0,0.3)] disabled:opacity-50"
                >
                  {funding ? (
                    <Iconify icon="lucide:loader-2" className="mr-2 text-xl animate-spin" />
                  ) : (
                    <Iconify icon="lucide:check-circle" className="mr-2 text-xl" />
                  )}
                  {funding ? 'Memproses...' : 'Konfirmasi & Tanda Tangani'}
                </button>
                <a
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-5 rounded-full text-lg font-medium border border-white/10 text-white hover:bg-white/5 transition-all duration-300"
                >
                  Kembali
                </a>
              </div>
            ) : (
              <div className="reveal active p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
                <Iconify icon="lucide:check-circle" className="text-4xl text-green-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">Escrow Berhasil Difund!</h3>
                <p className="text-gray-400 text-sm mb-4">Dana telah dikunci di smart contract. Proyek siap dimulai.</p>
                <a href="/dashboard" className="text-[#FF4500] text-sm font-medium hover:underline">
                  Kembali ke Dashboard →
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
