'use client';

import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import { useReputationSearch } from '@/lib/hooks/useReputationSearch';
import { useRevealAnimation } from '@/lib/hooks/useRevealAnimation';

import Iconify from '@/components/Iconify';

export default function Reputation() {
  const {
    address,
    setAddress,
    profile,
    loading,
    error,
    recentProfiles,
    fetchProfile,
  } = useReputationSearch();

  useRevealAnimation([]);

  const getStars = (rating: number) => {
    const stars = Math.round(rating / 100);
    return Array.from({ length: 5 }, (_, i) => (
      <Iconify
        key={i}
        icon={i < stars ? 'mdi:star' : 'mdi:star-outline'}
        className={`text-xl ${i < stars ? 'text-[#FF4500]' : 'text-gray-600'}`}
      />
    ));
  };

  const getOnTimeRate = (p: Profile) => {
    if (!p.totalJobs || p.totalJobs === '0') return '0%';
    return `${Math.round((parseInt(p.onTimePayments) / parseInt(p.totalJobs)) * 100)}%`;
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <NavigationBar activeItem="dashboard" />

      <main className="flex-1 pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16 reveal">
            <h1 className="text-4xl md:text-6xl font-medium mb-6 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Cari Reputasi <span className="italic text-[#FF4500]">On-Chain</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Verifikasi rekam jejak kuli dan kontraktor langsung dari blockchain. Transparansi tanpa batas untuk kerja yang lebih aman.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-20 reveal" style={{ transitionDelay: '100ms' }}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF4500] to-orange-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative flex items-center bg-[#111] border border-white/10 rounded-2xl p-2">
                <Iconify icon="lucide:search" className="ml-4 text-gray-500 text-xl" />
                <input
                  type="text"
                  placeholder="Masukkan alamat dompet (0x...)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchProfile()}
                  className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-white placeholder-gray-600 font-mono text-sm outline-none"
                />
                <button
                  onClick={fetchProfile}
                  disabled={loading}
                  className="bg-[#FF4500] hover:bg-[#e63e00] text-white px-8 py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Mencari...' : 'Cari'}
                </button>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-center text-gray-600 uppercase tracking-widest">
              Gunakan alamat wallet MetaMask untuk pencarian yang akurat
            </p>
          </div>

          {/* Profile Card */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-red-500/10 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Profile Card */}
          {profile && (
            <div className="max-w-4xl mx-auto reveal" style={{ transitionDelay: '200ms' }}>
              <div className="space-y-8">
                <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      parseInt(profile.rating) >= 400 && parseInt(profile.disputes) < 3
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : parseInt(profile.rating) >= 300
                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {parseInt(profile.rating) >= 400 && parseInt(profile.disputes) < 3 ? 'Reliable' : parseInt(profile.rating) >= 300 ? 'Average' : 'At Risk'}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-10 items-start md:items-center mb-12">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#FF4500] to-orange-800 p-0.5">
                      <div className="w-full h-full bg-[#111] rounded-[calc(1rem-0.5px)] flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${profile.user}`} alt="Avatar" className="w-full h-full opacity-80" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {profile.role === '0' ? 'Kuli' : 'Kontraktor'}
                        </h2>
                        <span className="px-3 py-0.5 rounded-full bg-white/5 text-gray-400 text-[10px] uppercase tracking-tighter">
                          {profile.role === '0' ? 'Worker' : 'Kontraktor'}
                        </span>
                      </div>
                      <p className="font-mono text-gray-500 text-sm flex items-center gap-2">
                        {profile.user?.slice(0, 6)}...{profile.user?.slice(-4)}
                      </p>
                      <div className="flex items-center gap-1 mt-4">
                        {getStars(parseInt(profile.rating))}
                        <span className="ml-2 text-white font-medium">{(parseInt(profile.rating) / 100).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Selesai</p>
                      <p className="text-2xl font-medium">{profile.totalJobs}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">On-Time</p>
                      <p className="text-2xl font-medium text-green-500">{getOnTimeRate(profile.totalJobs, profile.onTimePayments)}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Sengketa</p>
                      <p className="text-2xl font-medium">{profile.disputes}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Penghasilan</p>
                      <p className="text-2xl font-medium text-[#FF4500]">{profile.totalEarnings} ETH</p>
                    </div>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-6 opacity-60">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <Iconify icon="lucide:shield-check" className="text-[#FF4500] text-3xl mb-4" />
                    <h4 className="text-lg font-medium mb-2">Data Immutable</h4>
                    <p className="text-sm text-gray-500">Reputasi dicatat di blockchain dan tidak dapat diubah secara sepihak oleh siapapun.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <Iconify icon="lucide:database" className="text-[#FF4500] text-3xl mb-4" />
                    <h4 className="text-lg font-medium mb-2">Verifikasi GPS</h4>
                    <p className="text-sm text-gray-500">Setiap pekerjaan divalidasi dengan koordinat geografis asli dari lapangan.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <Iconify icon="lucide:award" className="text-[#FF4500] text-3xl mb-4" />
                    <h4 className="text-lg font-medium mb-2">Reward On-Chain</h4>
                    <p className="text-sm text-gray-500">Pekerja dengan rating tinggi mendapatkan akses prioritas ke proyek-proyek besar.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!profile && !loading && !error && (
            <div className="text-center text-gray-600 py-10">
              <Iconify icon="lucide:search" className="text-4xl mb-4" />
              <p>Masukkan alamat wallet untuk melihat reputasi on-chain</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
