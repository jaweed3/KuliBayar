'use client';

import Link from 'next/link';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

import Iconify from '@/components/Iconify';

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    const handleScroll = () => {
      const scrolled = window.scrollY;
      document.querySelectorAll('.parallax-card-up').forEach((el) => {
        (el as HTMLElement).style.setProperty('--scroll-offset-up', `${scrolled * -0.05}px`);
      });
      document.querySelectorAll('.parallax-card-down').forEach((el) => {
        (el as HTMLElement).style.setProperty('--scroll-offset-down', `${scrolled * 0.05}px`);
      });

      const heroWrapper = document.getElementById('hero-content-wrapper');
      if (heroWrapper && scrolled < 1000) {
        heroWrapper.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroWrapper.style.opacity = String(Math.max(0, 1 - scrolled / 800));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505]">
      <NavigationBar activeItem="dashboard" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 bg-[#050505]">
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-40 mix-blend-screen">
            <img
              src="https://framerusercontent.com/images/9zvwRJAavKKacVyhFCwHyXW1U.png?width=1536&height=1024"
              alt="Atmosphere"
              className="w-full h-full object-cover object-center opacity-80"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505] z-10" />
        </div>

        <div className="absolute -left-[10%] top-[-10%] md:left-[-5%] md:top-[-15%] w-[50vw] md:w-[40vw] max-w-[800px] z-10 pointer-events-none mix-blend-hard-light opacity-60 animate-float-left">
          <img
            src="https://framerusercontent.com/images/KNhiA5A2ykNYqNkj04Hk6BVg5A.png?width=1540&height=1320"
            alt="Worker Hand"
            className="w-full h-auto object-contain"
          />
        </div>

        <div className="absolute -right-[10%] bottom-[-10%] md:right-[-5%] md:bottom-[-5%] w-[45vw] md:w-[35vw] max-w-[700px] z-10 pointer-events-none mix-blend-hard-light opacity-60 animate-float-right">
          <img
            src="https://framerusercontent.com/images/X89VFCABCEjjZ4oLGa3PjbOmsA.png?width=1542&height=1002"
            alt="Foundation"
            className="w-full h-auto object-contain grayscale brightness-50"
          />
        </div>

        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center h-full">
          <div id="hero-content-wrapper" className="max-w-4xl mx-auto">
            <div className="reveal">
              <h1 className="text-5xl md:text-7xl font-medium leading-[1.1] tracking-tight mb-6 text-[#ffe0e0]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Bayaran Kuli, <br />
                <span className="italic font-light text-[#FF4500] text-glow">Dijamin On-Chain.</span>
              </h1>
            </div>

            <div className="reveal" style={{ transitionDelay: '200ms' }}>
              <p className="text-base md:text-lg text-[#ffe0e0]/90 max-w-lg mx-auto mb-16 font-light tracking-wide leading-relaxed">
                Platform escrow on-chain untuk konstruksi Indonesia. Dana dikunci di smart contract, cair otomatis setelah kerja terverifikasi via foto + GPS.
              </p>
            </div>

            <div className="reveal flex flex-col items-center gap-6" style={{ transitionDelay: '400ms' }}>
              <Link
                href="/dashboard"
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-[#FF4500]/20 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="relative border border-white/20 bg-white/5 backdrop-blur-sm px-6 py-2 rounded-full flex items-center gap-3 text-xs md:text-sm text-white/80 uppercase tracking-widest hover:bg-white/10 transition-colors duration-300">
                  <span>Masuk ke Dashboard</span>
                </div>
              </Link>

              <div className="flex items-center gap-4 text-[10px] md:text-xs text-white/40 uppercase tracking-widest mt-8 font-mono">
                <span>JAKARTA, INDONESIA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="expertise" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center reveal">
            <h2 className="text-3xl md:text-5xl lg:text-6xl leading-tight text-white/90 mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
              Kami menghilangkan keterlambatan pembayaran, membangun kepercayaan on-chain.
            </h2>
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-light">
              Transparansi adalah fondasi. Kami mengunci dana kontraktor dan membayar kuli harian berdasarkan verifikasi nyata dari lapangan.
            </p>
          </div>

          <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="reveal font-bold text-xl tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>ADHI KARYA</div>
            <div className="reveal font-bold text-xl tracking-widest" style={{ fontFamily: "'Playfair Display', serif", transitionDelay: '100ms' }}>WIKA</div>
            <div className="reveal font-bold text-xl tracking-widest" style={{ fontFamily: "'Playfair Display', serif", transitionDelay: '200ms' }}>PP CORP</div>
            <div className="reveal font-bold text-xl tracking-widest" style={{ fontFamily: "'Playfair Display', serif", transitionDelay: '300ms' }}>PUPR</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="works" className="py-40 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="reveal mb-32">
            <h2 className="text-5xl md:text-7xl text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
              Bagaimana <br />
              <span className="italic text-[#FF4500]">KuliBayar Bekerja</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="parallax-card-down">
              <div className="reveal bg-[#FF4500] rounded-3xl p-8 md:p-12 aspect-[4/5] flex flex-col justify-between shadow-2xl hover:shadow-[0_20px_50px_rgba(255,69,0,0.3)] transition-all duration-500 group cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-full bg-black/10 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <Iconify icon="lucide:shield-check" className="text-black text-3xl" />
                  </div>
                  <span className="text-black font-medium text-sm border border-black/20 px-3 py-1 rounded-full">01</span>
                </div>

                <div>
                  <h3 className="text-4xl md:text-5xl text-black mb-4 leading-none tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Dana <br />Tersertifikasi
                  </h3>
                  <p className="text-black/70 text-lg leading-snug">
                    Kontraktor mengunci dana proyek di smart contract sebelum pekerjaan dimulai. Tidak ada manipulasi, dana aman di dalam protokol.
                  </p>
                </div>

                <div className="w-full h-px bg-black/10 mt-8" />
              </div>
            </div>

            <div className="parallax-card-up md:mt-24">
              <div className="reveal bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 aspect-[4/5] flex flex-col justify-between shadow-2xl group cursor-pointer hover:border-[#FF4500]/50 transition-all duration-500" style={{ transitionDelay: '150ms' }}>
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Iconify icon="lucide:camera" className="text-white text-3xl" />
                  </div>
                  <span className="text-white/50 font-medium text-sm border border-white/10 px-3 py-1 rounded-full">02</span>
                </div>

                <div>
                  <h3 className="text-4xl md:text-5xl text-white mb-4 leading-none tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Verifikasi <br />Otomatis
                  </h3>
                  <p className="text-gray-400 text-lg leading-snug">
                    Bukti foto + koordinat GPS dari lapangan diverifikasi on-chain. Pembayaran langsung dilepas ke dompet kuli tanpa perantara.
                  </p>
                </div>

                <div className="w-full h-px bg-white/10 mt-8" />
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #FF4500 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
      </section>

      <Footer />
    </div>
  );
}
