'use client';

import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import { useMyWork } from '@/lib/hooks/useMyWork';
import { useRevealAnimation } from '@/lib/hooks/useRevealAnimation';

export default function MyWork() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data load
  useEffect(() => {
    setTimeout(() => {
      setProjects([
        { id: 1, name: 'Pondasi Gudang Logistik', location: 'Cikarang Selatan, Bekasi', kontraktor: 'Budi Santoso', kontraktorAddress: '0xac09...f2ff80', status: 'active', statusLabel: 'Aktif', daysCompleted: 3, durationDays: 10, dailyRate: '0.010', totalEarned: '0.030', lastProof: '2 jam lalu' },
        { id: 2, name: 'Renovasi Ruko Blok A', location: 'Tebet, Jakarta Selatan', kontraktor: 'Ahmad Wijaya', kontraktorAddress: '0x5678...abcd', status: 'active', statusLabel: 'Aktif', daysCompleted: 1, durationDays: 5, dailyRate: '0.015', totalEarned: '0.015', lastProof: '5 jam lalu' },
        { id: 3, name: 'Pemasangan Keramik Lt 2', location: 'Bintaro, Tangerang Selatan', kontraktor: 'Dewi Lestari', kontraktorAddress: '0x9abc...def0', status: 'pending', statusLabel: 'Menunggu', daysCompleted: 0, durationDays: 12, dailyRate: '0.008', totalEarned: '0.000', lastProof: 'Belum ada' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  // Re-observe reveal elements when loading finishes
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
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <NavigationBar activeItem="my-work" />
      <main className="container mx-auto px-6 pt-40 pb-20 relative z-10">
        <header className="mb-12 reveal">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Kerjaan Saya</h1>
              <p className="text-gray-400 max-w-xl">Lihat proyek aktif yang sedang Anda kerjakan. Kirim bukti kerja harian untuk mencairkan bayaran.</p>
            </div>
            <a href="/dashboard/proofs" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF4500] text-white font-medium hover:bg-[#e63e00] transition-colors">
              <iconify-icon icon="lucide:camera" />
              <span>Kirim Bukti</span>
            </a>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 reveal" style={{ transitionDelay: '100ms' }}>
          <div className="bg-[#111] border border-white/5 p-5 rounded-2xl"><p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Proyek Aktif</p><p className="text-2xl font-bold text-[#FF4500]">{projects.filter(p => p.status === 'active').length}</p></div>
          <div className="bg-[#111] border border-white/5 p-5 rounded-2xl"><p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Total Dikerjakan</p><p className="text-2xl font-bold">{projects.length}</p></div>
          <div className="bg-[#111] border border-white/5 p-5 rounded-2xl"><p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Total Earned</p><p className="text-2xl font-bold text-green-500">{projects.reduce((sum, p) => sum + parseFloat(p.totalEarned), 0).toFixed(3)} ETH</p></div>
          <div className="bg-[#111] border border-white/5 p-5 rounded-2xl"><p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Hari Ini</p><p className="text-2xl font-bold">2/3</p></div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Memuat proyek...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Belum ada proyek aktif</div>
        ) : (
          <div className="space-y-6 reveal" style={{ transitionDelay: '200ms' }}>
            {projects.map((project) => {
              const progress = project.durationDays > 0 ? (project.daysCompleted / project.durationDays) * 100 : 0;
              return (
                <div key={project.id} className="bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8 hover:border-[#FF4500]/30 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(project.status)}`}>
                          {project.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block mr-1" />}
                          {project.statusLabel}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-1"><iconify-icon icon="lucide:map-pin" class="text-[#FF4500]" /><span>{project.location}</span></div>
                        <div className="flex items-center gap-1"><iconify-icon icon="lucide:user" class="text-[#FF4500]" /><span>Kontraktor: {project.kontraktor}</span></div>
                        <div className="flex items-center gap-1"><iconify-icon icon="lucide:clock" class="text-[#FF4500]" /><span>Bukti terakhir: {project.lastProof}</span></div>
                      </div>
                      <div className="max-w-md">
                        <div className="flex justify-between text-xs mb-1.5"><span className="text-gray-500 uppercase tracking-widest font-bold">Progres Hari</span><span className="text-white">{project.daysCompleted} / {project.durationDays}</span></div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#FF4500] rounded-full" style={{ width: `${progress}%` }} /></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-4 md:min-w-[200px]">
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Tarif/Hari</p><p className="text-sm font-mono font-medium">{project.dailyRate} ETH</p></div>
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Earned</p><p className="text-sm font-mono font-medium text-green-500">{project.totalEarned} ETH</p></div>
                      </div>
                      {project.status === 'active' ? (
                        <a href="/dashboard/proofs" className="w-full py-3 rounded-xl bg-[#FF4500] text-white text-center text-sm font-bold hover:bg-[#e63e00] transition-colors flex items-center justify-center gap-2"><iconify-icon icon="lucide:camera" />Kirim Bukti Kerja</a>
                      ) : (
                        <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-center text-sm font-medium">Menunggu Persetujuan</div>
                      )}
                    </div>
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
