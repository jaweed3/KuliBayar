'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { API_BASE } from '@/lib/config';
import Iconify from '@/components/Iconify';

const ROLES = [
  { value: 0, label: 'Kuli', icon: 'lucide:hard-hat', desc: 'Cari proyek, kirim bukti kerja, dapat bayaran harian' },
  { value: 1, label: 'Kontraktor', icon: 'lucide:building-2', desc: 'Buat proyek, kelola tim, bayar lewat escrow' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { address, signOut } = useAuth();
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!address) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Hubungkan wallet dulu</p>
          <Link href="/" className="text-[#FF4500] hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === null) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/reputation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Wallet-Address': address },
        body: JSON.stringify({ role: selectedRole, name }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        setTimeout(() => router.push('/dashboard'), 1500);
      } else setError(data.error || 'Gagal daftar');
    } catch (err: any) {
      setError(err.message || 'Gagal menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <Iconify icon="lucide:check-circle-2" className="text-6xl text-green-500 mx-auto mb-4" />
          <p className="text-white text-2xl font-bold mb-2">Pendaftaran Berhasil!</p>
          <p className="text-gray-500">Mengarahkan ke dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-full max-w-lg px-6">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-bold tracking-tighter text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            KuliBayar.
          </Link>
          <p className="text-gray-500 mt-2">Buat akun kamu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Pilih Role</p>
            <div className="grid grid-cols-2 gap-4">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setSelectedRole(r.value)}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    selectedRole === r.value
                      ? 'border-[#FF4500] bg-[#FF4500]/5'
                      : 'border-white/10 bg-[#1a1a1a] hover:border-white/20'
                  }`}
                >
                  <Iconify icon={r.icon} className={`text-2xl mb-3 ${selectedRole === r.value ? 'text-[#FF4500]' : 'text-gray-500'}`} />
                  <p className={`font-bold text-sm mb-1 ${selectedRole === r.value ? 'text-white' : 'text-gray-400'}`}>{r.label}</p>
                  <p className="text-[10px] text-gray-600 leading-relaxed">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3 block">Nama (opsional)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#FF4500]/50 transition-colors"
            />
          </div>

          <div className="bg-[#111] border border-white/10 rounded-3xl p-4 flex items-center gap-3">
            <Iconify icon="lucide:info" className="text-[#FF4500] flex-shrink-0" />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Wallet: <code className="text-gray-400">{address.slice(0, 8)}...{address.slice(-4)}</code>
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={selectedRole === null || loading}
            className="w-full py-4 bg-[#FF4500] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#e63e00] transition-all btn-glow disabled:opacity-30"
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>

          <p className="text-center">
            <button type="button" onClick={signOut} className="text-[10px] text-gray-600 hover:text-gray-400 uppercase tracking-widest">
              Gunakan wallet lain
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
