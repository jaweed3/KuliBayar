'use client';

import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import NotificationBanner from '@/components/NotificationBanner';
import { useDisputes } from '@/lib/hooks/useDisputes';
import { useRevealAnimation } from '@/lib/hooks/useRevealAnimation';

import Iconify from '@/components/Iconify';

export default function DisputeResolution() {
  const {
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
  } = useDisputes();

  useRevealAnimation([]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <NavigationBar activeItem="dashboard" />

      <main className="relative pt-40 pb-32 flex-1">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF4500]/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FF4500]/5 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="reveal mb-12">
            <nav className="flex mb-4 text-xs font-mono uppercase tracking-widest text-white/40">
              <a href="/dashboard" className="hover:text-[#FF4500] transition-colors">Dashboard</a>
              <span className="mx-2">/</span>
              <span className="text-white/80">Sengketa</span>
            </nav>
            <h1 className="text-4xl md:text-6xl font-medium tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Resolusi <span className="italic text-[#FF4500]">Sengketa</span>
            </h1>
            <p className="mt-4 text-gray-400 font-light max-w-2xl">
              Pusat mediasi on-chain untuk menyelesaikan masalah pembayaran atau kualitas kerja secara adil dan transparan.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column - Form */}
            <div className="lg:col-span-7 space-y-8">
              <section className="reveal bg-[#111] border border-white/5 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <Iconify icon="lucide:alert-triangle" className="text-[#FF4500] text-3xl" />
                  <h2 className="text-2xl font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Ajukan Sengketa Baru</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Project ID */}
                  <div className="space-y-2">
                    <label className="text-sm uppercase tracking-widest text-gray-500 font-medium">Project ID</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan ID proyek"
                      value={form.projectId}
                      onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-all outline-none"
                    />
                  </div>

                  {/* Reason Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm uppercase tracking-widest text-gray-500 font-medium">Alasan Sengketa</label>
                    <select
                      required
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#111]">Pilih alasan...</option>
                      <option value="Foto tidak sesuai" className="bg-[#111]">Foto tidak sesuai</option>
                      <option value="Dana tidak dikirim" className="bg-[#111]">Dana tidak dikirim</option>
                      <option value="Pekerjaan tidak selesai" className="bg-[#111]">Pekerjaan tidak selesai</option>
                      <option value="Kualitas buruk" className="bg-[#111]">Kualitas buruk</option>
                      <option value="Kesalahan sistem" className="bg-[#111]">Kesalahan sistem</option>
                      <option value="Lainnya" className="bg-[#111]">Lainnya</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm uppercase tracking-widest text-gray-500 font-medium">Deskripsi Detail</label>
                    <textarea
                      required
                      minLength={20}
                      placeholder="Jelaskan secara rinci kronologi dan bukti yang Anda miliki..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-all outline-none resize-none"
                    />
                    <div className="text-xs text-white/30">{form.description.length}/20 minimum karakter</div>
                  </div>

                  {/* Result Message */}
                  {result && (
                    <NotificationBanner
                      type={bannerType}
                      message={result}
                      onDismiss={dismissBanner}
                    />
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 ${
                      canSubmit && !loading
                        ? 'bg-[#FF4500] text-white hover:bg-[#e63e00] hover:scale-[1.02]'
                        : 'bg-white/5 text-white/60 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Iconify icon="lucide:loader-2" className="animate-spin-custom text-xl" />
                        <span>Mengirim...</span>
                      </div>
                    ) : (
                      'Kirim Laporan Sengketa'
                    )}
                  </button>
                </form>
              </section>
            </div>

            {/* Right Column - Status + History */}
            <div className="lg:col-span-5 space-y-8">
              {/* Active Dispute Status */}
              <section className="reveal bg-[#111] border border-white/5 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-medium mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Status Sengketa Aktif</h2>

                {activeDispute ? (
                  <>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-[#FF4500]/20 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#FF4500] rounded-full animate-pulse" />
                        <span className="font-medium uppercase tracking-tighter">Sedang Ditinjau</span>
                      </div>
                      <span className="text-xs text-gray-500">ID: {activeDispute.id}</span>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between border-b border-white/5 pb-3">
                        <span className="text-gray-500">Tanggal Dibuat</span>
                        <span className="text-white">{activeDispute.date}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-3">
                        <span className="text-gray-500">Alasan</span>
                        <span className="text-white">{activeDispute.reason}</span>
                      </div>
                      <div className="flex justify-between pb-3">
                        <span className="text-gray-500">Petugas Admin</span>
                        <span className="text-white">AI Oracle Beta</span>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5 italic text-sm text-gray-400">
                      <p>&quot;Kami sedang memverifikasi koordinat GPS dan metadata foto proyek. Mohon tunggu hingga 24 jam untuk keputusan akhir.&quot;</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Iconify icon="lucide:check-circle" className="text-4xl text-green-500/50 mb-4" />
                    <p>Tidak ada sengketa aktif</p>
                  </div>
                )}
              </section>

              {/* Dispute History */}
              <section className="reveal bg-[#111] border border-white/5 rounded-3xl p-8 shadow-2xl" style={{ transitionDelay: '200ms' }}>
                <h2 className="text-2xl font-medium mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Riwayat Sengketa</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className={`p-5 bg-white/5 rounded-2xl border border-white/5 transition-colors group ${
                        item.status === 'completed' ? 'hover:border-green-500/30' : 'hover:border-gray-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-gray-500">{item.id}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold tracking-widest ${
                            item.status === 'completed'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-gray-500/10 text-gray-400'
                          }`}
                        >
                          {item.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                        </span>
                      </div>
                      <h4 className="font-medium mb-1">{item.reason}</h4>
                      <p className="text-xs text-gray-500 mb-3">{item.date} • Hasil: {item.result}</p>
                      {item.status === 'completed' && (
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Iconify icon="lucide:check-circle" className="text-green-500" />
                          <span>Dana telah disalurkan ulang</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
