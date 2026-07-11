'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '@/lib/config';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import NotificationBanner from '@/components/NotificationBanner';

import Iconify from '@/components/Iconify';

export default function PhotoCheckin() {
  const [form, setForm] = useState({ projectId: '' });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gps, setGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [bannerType, setBannerType] = useState<'success' | 'error'>('success');

  // Liveness challenge state
  const [challenge, setChallenge] = useState<{
    challengeId: string;
    challenge: string;
    expiresAt: string;
  } | null>(null);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeError, setChallengeError] = useState<string | null>(null);

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

  const getGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setGpsLoading(false);
      },
      (err) => {
        alert('Gagal dapat lokasi: ' + err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fetchChallenge = async () => {
    if (!form.projectId) return;

    setChallengeLoading(true);
    setChallengeError(null);

    try {
      const res = await fetch(`${API_BASE}/api/challenges/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: form.projectId,
          workerAddress: '0x0000000000000000000000000000000000000001' // Mock address for demo
        })
      });

      const data = await res.json();

      if (data.success) {
        setChallenge({
          challengeId: data.challengeId,
          challenge: data.challenge,
          expiresAt: data.expiresAt
        });
      } else {
        setChallengeError(data.error || 'Gagal membuat challenge');
      }
    } catch (err) {
      setChallengeError('Gagal mengambil challenge');
    } finally {
      setChallengeLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (event) => setPhotoPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const canSubmit = gps && photo && form.projectId && challenge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('projectId', form.projectId);
    formData.append('photo', photo);
    formData.append('latitude', gps.lat.toString());
    formData.append('longitude', gps.lng.toString());
    formData.append('accuracy', gps.accuracy.toString());
    formData.append('challengeId', challenge.challengeId);

    try {
      const res = await fetch(`${API_BASE}/api/proofs`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setResult(`Bukti kerja berhasil dikirim! Proof ID: ${data.proofId}`);
        setBannerType('success');
        // Reset form after success
        setPhoto(null);
        setPhotoPreview(null);
        setChallenge(null);
        if (photoInputRef.current) photoInputRef.current.value = '';
      } else {
        setResult(`Error: ${data.error || 'Unknown error'}`);
        setBannerType('error');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setResult(`Gagal: ${message}`);
      setBannerType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <NavigationBar activeItem="dashboard" />

      <main className="relative pt-40 pb-32 flex-1">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF4500]/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FF4500]/5 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="reveal mb-12">
              <nav className="flex mb-4 text-xs font-mono uppercase tracking-widest text-white/40">
                <a href="/dashboard" className="hover:text-[#FF4500] transition-colors">Dashboard</a>
                <span className="mx-2">/</span>
                <span className="text-white/80">Kirim Bukti Kerja</span>
              </nav>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Kirim Bukti Kerja</h1>
              <p className="mt-4 text-gray-400 font-light">Laporkan progress harian Anda untuk mencairkan bayaran harian secara otomatis.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Project ID */}
              <div className="reveal" style={{ transitionDelay: '100ms' }}>
                <label className="block text-sm font-medium text-gray-400 mb-3 uppercase tracking-widest">ID Proyek</label>
                <input
                  type="number"
                  required
                  placeholder="Masukkan ID proyek (contoh: 1)"
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  className="w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white form-input-focus transition-all duration-300"
                />
              </div>

              {/* GPS Location */}
              <div className="reveal" style={{ transitionDelay: '200ms' }}>
                <label className="block text-sm font-medium text-gray-400 mb-3 uppercase tracking-widest">Lokasi GPS</label>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                  <button
                    type="button"
                    onClick={getGPS}
                    disabled={gpsLoading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 mb-4"
                  >
                    {gpsLoading ? (
                      <Iconify icon="lucide:loader-2" className="animate-spin-custom text-lg text-[#FF4500]" />
                    ) : gps ? (
                      <Iconify icon="lucide:check-circle" className="text-lg text-green-400" />
                    ) : (
                      <Iconify icon="lucide:map-pin" className="text-lg text-[#FF4500]" />
                    )}
                    <span>{gpsLoading ? 'Mencari Lokasi...' : gps ? 'Lokasi Berhasil Didapat' : 'Dapatkan Lokasi Saat Ini'}</span>
                  </button>
                  <div className={`text-xs font-mono ${gps ? 'text-green-400' : 'text-white/30 italic'}`}>
                    {gps ? (
                      <>
                        <div>Lat: {gps.lat.toFixed(6)}, Lng: {gps.lng.toFixed(6)}</div>
                        <div className={gps.accuracy > 50 ? 'text-yellow-400' : 'text-green-400'}>
                          Akurasi: {gps.accuracy.toFixed(1)}m {gps.accuracy > 50 ? '(kurang akurat)' : '(baik)'}
                        </div>
                      </>
                    ) : 'Koordinat belum didapatkan...'}
                  </div>
                </div>
              </div>

              {/* Liveness Challenge */}
              <div className="reveal" style={{ transitionDelay: '250ms' }}>
                <label className="block text-sm font-medium text-gray-400 mb-3 uppercase tracking-widest">Verifikasi Kehadiran</label>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                  {!challenge ? (
                    <>
                      <button
                        type="button"
                        onClick={fetchChallenge}
                        disabled={!form.projectId || challengeLoading}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 mb-4"
                      >
                        {challengeLoading ? (
                          <Iconify icon="lucide:loader-2" className="animate-spin-custom text-lg text-[#FF4500]" />
                        ) : (
                          <Iconify icon="lucide:shield-check" className="text-lg text-[#FF4500]" />
                        )}
                        <span>{challengeLoading ? 'Membuat Challenge...' : 'Dapatkan Challenge'}</span>
                      </button>
                      {challengeError && (
                        <div className="text-xs text-red-400 mt-2">{challengeError}</div>
                      )}
                      <div className="text-xs text-white/30 italic mt-2">
                        Challenge diperlukan untuk membuktikan kehadiran Anda di lokasi proyek
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-400">
                        <Iconify icon="lucide:check-circle" className="text-lg" />
                        <span className="text-sm font-medium">Challenge Aktif</span>
                      </div>
                      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-green-400/20">
                        <div className="text-lg font-mono text-white mb-2">{challenge.challenge}</div>
                        <div className="text-xs text-white/50">
                          Berlaku sampai: {new Date(challenge.expiresAt).toLocaleTimeString('id-ID')}
                        </div>
                      </div>
                      <div className="text-xs text-yellow-400">
                        <Iconify icon="lucide:alert-triangle" className="inline mr-1" />
                        Tulis kode di atas di kertas, pegang saat mengambil foto
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="reveal" style={{ transitionDelay: '300ms' }}>
                <label className="block text-sm font-medium text-gray-400 mb-3 uppercase tracking-widest">Foto Progress Kerja</label>
                <div className="relative group bg-[#111] border-2 border-dashed border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#FF4500]/30">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />

                  {!photoPreview ? (
                    <label
                      onClick={() => photoInputRef.current?.click()}
                      className="flex flex-col items-center justify-center aspect-video cursor-pointer py-12 px-6 text-center transition-all duration-300"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#FF4500]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                        <Iconify icon="lucide:camera" className="text-3xl text-[#FF4500]" />
                      </div>
                      <span className="text-sm font-medium text-white/80">Ambil atau Upload Foto</span>
                      <span className="text-xs text-white/40 mt-2">Format JPG, PNG (Max 5MB)</span>
                    </label>
                  ) : (
                    <div className="relative aspect-video bg-black">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-500 transition-colors duration-300 text-white shadow-xl"
                      >
                        <Iconify icon="lucide:x" className="text-xl" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Result Message */}
              {result && (
                <NotificationBanner
                  type={bannerType}
                  message={result}
                  onDismiss={dismissBanner}
                />
              )}

              {/* Submit */}
              <div className="reveal" style={{ transitionDelay: '400ms' }}>
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest transition-all duration-300 ${
                    canSubmit && !loading
                      ? 'bg-[#FF4500] text-white hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(255,69,0,0.3)]'
                      : 'bg-white/5 text-white/60 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Iconify icon="lucide:loader-2" className="animate-spin-custom text-xl" />
                      <span>Mengirim...</span>
                    </div>
                  ) : (
                    'Kirim Bukti Kerja'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
