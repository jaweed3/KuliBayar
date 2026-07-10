// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';

export default function NavigationBar({ activeItem = 'dashboard' }: { activeItem?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      id="main-nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-4 bg-[#050505]/95 backdrop-blur-md border-b border-white/5'
          : 'py-8'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="/" className="text-2xl font-bold tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
          KuliBayar.
        </a>

        <div className="hidden md:flex items-center space-x-6">
          <a href="/dashboard" className={`text-sm transition-colors duration-300 ${activeItem === 'projects' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
            Proyek Saya
          </a>
          <a href="/dashboard/my-work" className={`text-sm transition-colors duration-300 ${activeItem === 'my-work' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
            Kerjaan Saya
          </a>
          <a href="/dashboard/proofs" className={`text-sm transition-colors duration-300 ${activeItem === 'proofs' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
            Kirim Bukti
          </a>
          <a href="/dashboard/payments" className={`text-sm transition-colors duration-300 ${activeItem === 'payments' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
            Pembayaran
          </a>
          <a href="/dashboard/reputation" className={`text-sm transition-colors duration-300 ${activeItem === 'reputation' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
            Reputasi
          </a>
        </div>

        <a
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium bg-[#FF4500] text-white hover:scale-105 hover:bg-[#e63e00] transition-all duration-300"
        >
          Dashboard
        </a>
      </div>
    </nav>
  );
}
