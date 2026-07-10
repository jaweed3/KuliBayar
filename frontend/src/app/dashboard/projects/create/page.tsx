'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '@/lib/config';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import NotificationBanner from '@/components/NotificationBanner';

export default function CreateProject() {
  const [form, setForm] = useState({
    kuliAddress: '',
    dailyRate: '',
    durationDays: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [bannerType, setBannerType] = useState<'success' | 'error'>('success');

  const dismissBanner = useCallback(() => {
    setResult(null);
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kuli: form.kuliAddress,
          dailyRate: parseFloat(form.dailyRate),
          durationDays: parseInt(form.durationDays),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(`Proyek berhasil dibuat! ID: ${data.projectId}`);
        setBannerType('success');
        setForm({ kuliAddress: '', dailyRate: '', durationDays: '' });
      } else {
        setResult(`Error: ${data.error || 'Unknown error'}`);
        setBannerType('error');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setResult(`Gagal membuat proyek: ${message}`);
      setBannerType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <NavigationBar activeItem="dashboard" />

      <main className="flex-1 pt-32 pb-20 relative overflow-hidden flex items-center justify-center">
        <div className="atmos-glow top-0 right-0 translate-x-1/2 -translate-y-1/2" />
        <div className="atmos-glow bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12 reveal">
              <h1 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Buat Proyek Baru</h1>
              <p className="text-gray-400 font-light tracking-wide">Konfigurasikan kontrak kerja on-chain Anda. Pastikan alamat wallet kuli benar untuk mencegah kesalahan pembayaran.</p>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl reveal" style={{ transitionDelay: '100ms' }}>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium ml-1">Alamat Wallet Kuli</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                      <iconify-icon icon="logos:ethereum-color" class="text-xl" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="0x..."
                      value={form.kuliAddress}
                      onChange={(e) => setForm({ ...form, kuliAddress: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-mono placeholder:text-gray-600 form-input-focus"
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 ml-1">Alamat Ethereum/EVM wallet tujuan bayaran otomatis.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium ml-1">Tarif Per Hari (ETH)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                        <iconify-icon icon="lucide:banknote" class="text-xl" />
                      </span>
                      <input
                        type="number"
                        required
                        step="0.001"
                        placeholder="0.01"
                        value={form.dailyRate}
                        onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-gray-600 form-input-focus"
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-mono text-[#FF4500]">ETH</span>
                    </div>
                    <p className="text-[10px] text-gray-600 ml-1">Jumlah ETH yang cair setiap kali proof diverifikasi.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium ml-1">Durasi Proyek (Hari)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                        <iconify-icon icon="lucide:calendar" class="text-xl" />
                      </span>
                      <input
                        type="number"
                        required
                        placeholder="5"
                        value={form.durationDays}
                        onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 form-input-focus"
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 ml-1">Total hari kerja yang akan dikunci dananya.</p>
                  </div>
                </div>

                {result && (
                  <NotificationBanner
                    type={bannerType}
                    message={result}
                    onDismiss={dismissBanner}
                  />
                )}

                <div className="pt-4 space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FF4500] hover:bg-[#e63e00] text-white font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group overflow-hidden relative shadow-[0_10px_30px_rgba(255,69,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <iconify-icon icon="lucide:loader-2" class="animate-spin text-xl" />
                    ) : (
                      <>
                        <span className="relative z-10">Buat Proyek</span>
                        <iconify-icon icon="lucide:plus" class="text-xl group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                  </button>
                  <a
                    href="/dashboard"
                    className="w-full flex items-center justify-center py-4 text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    Batal & Kembali ke Dashboard
                  </a>
                </div>
              </form>
            </div>

            <div className="mt-12 p-6 rounded-3xl border border-white/5 bg-white/[0.02] reveal" style={{ transitionDelay: '200ms' }}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <iconify-icon icon="lucide:info" class="text-[#FF4500]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Informasi Escrow</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Setelah proyek dibuat, Anda harus menyetor dana (Fund Escrow) ke smart contract. Dana hanya akan cair ke wallet kuli setelah sistem memverifikasi bukti kerja harian.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
