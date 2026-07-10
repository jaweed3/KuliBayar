'use client';

import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import { usePayments } from '@/lib/hooks/usePayments';
import { useRevealAnimation } from '@/lib/hooks/useRevealAnimation';

import Iconify from '@/components/Iconify';

export default function Payments() {
  const { payments, loading, totalEarned } = usePayments();
  useRevealAnimation([loading, payments]);

  return (
    <div className="min-h-screen bg-[#050505]">
      <NavigationBar activeItem="payments" />
      <main className="container mx-auto px-6 pt-40 pb-20 relative z-10">
        {/* Header */}
        <header className="mb-12 reveal">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Riwayat Pembayaran</h1>
              <p className="text-gray-400 max-w-xl">Lihat semua pembayaran yang diterima dari proyek-proyek Anda. Semua transaksi tercatat on-chain.</p>
            </div>
          </div>
        </header>

        {/* Wallet Balance Card */}
        <div className="reveal mb-12">
          <div className="bg-gradient-to-r from-[#FF4500] to-orange-600 rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-black/10 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/3" />
            <div className="relative z-10">
              <p className="text-black/60 text-sm font-medium uppercase tracking-widest mb-2">Saldo Wallet</p>
              <div className="text-4xl md:text-5xl font-mono font-bold text-black mb-6">0.045 <span className="text-xl">ETH</span></div>
              <div className="flex flex-wrap gap-4">
                <div className="bg-black/10 rounded-2xl px-6 py-3">
                  <p className="text-black/50 text-[10px] uppercase tracking-widest font-bold">Total Diterima</p>
                  <p className="text-black font-mono font-bold">{totalEarned.toFixed(3)} ETH</p>
                </div>
                <div className="bg-black/10 rounded-2xl px-6 py-3">
                  <p className="text-black/50 text-[10px] uppercase tracking-widest font-bold">Transaksi</p>
                  <p className="text-black font-mono font-bold">{payments.length}</p>
                </div>
                <div className="bg-black/10 rounded-2xl px-6 py-3">
                  <p className="text-black/50 text-[10px] uppercase tracking-widest font-bold">Proyek Aktif</p>
                  <p className="text-black font-mono font-bold">2</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="reveal" style={{ transitionDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>Riwayat Transaksi</h2>
            <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Updated: Just now</span>
          </div>
          <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-white/10 rounded" />
                      <div className="h-3 w-1/4 bg-white/5 rounded" />
                    </div>
                    <div className="h-4 w-16 bg-white/10 rounded" />
                    <div className="h-6 w-20 bg-white/10 rounded-full" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                    <div className="h-3 w-20 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-20 text-gray-500">Belum ada pembayaran</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                    <th className="px-6 py-5">Proyek</th><th className="px-6 py-5">Hari</th><th className="px-6 py-5">Jumlah</th><th className="px-6 py-5">Status</th><th className="px-6 py-5">Waktu</th><th className="px-6 py-5">TX Hash</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#FF4500]/10 flex items-center justify-center"><iconify-icon icon="lucide:briefcase" class="text-[#FF4500] text-sm" /></div><div><p className="text-sm font-medium">{payment.projectName}</p><p className="text-[10px] text-gray-500">ID: {payment.projectId}</p></div></div></td>
                        <td className="px-6 py-5"><span className="text-sm font-mono">Day {payment.day}</span></td>
                        <td className="px-6 py-5"><span className="text-sm font-mono font-bold text-green-500">+{payment.amount} ETH</span></td>
                        <td className="px-6 py-5"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${payment.status === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}><iconify-icon icon={payment.status === 'success' ? 'lucide:check-circle' : 'lucide:timer'} class="text-xs" />{payment.status === 'success' ? 'Success' : 'Pending'}</span></td>
                        <td className="px-6 py-5"><span className="text-xs text-gray-400">{payment.timestamp}</span></td>
                        <td className="px-6 py-5"><code className="text-xs font-mono text-gray-500 group-hover:text-gray-300 transition-colors cursor-pointer">{payment.txHash}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 reveal" style={{ transitionDelay: '200ms' }}>
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-[#FF4500]/5 border border-[#FF4500]/20">
            <iconify-icon icon="lucide:info" class="text-[#FF4500] text-2xl shrink-0" />
            <div>
              <h4 className="text-sm font-semibold mb-1">Tentang Pembayaran</h4>
              <p className="text-xs text-gray-400 leading-relaxed">Semua pembayaran dikirim langsung ke wallet Anda setelah bukti kerja (foto + GPS) diverifikasi oleh AI Oracle. Dana berasal dari escrow yang dikunci di smart contract oleh kontraktor.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
