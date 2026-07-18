'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function NavigationBar({ activeItem = 'dashboard' }: { activeItem?: string }) {
  const { address, role, isAuthenticated, isLoading, signIn, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const connectAndSignIn = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    setSigningIn(true);
    try {
      // First connect wallet
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      // Switch to BSC Testnet
      try {
        await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x61' }] });
      } catch {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x61',
            chainName: 'BNB Smart Chain Testnet',
            nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
            rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
            blockExplorerUrls: ['https://testnet.bscscan.com'],
          }],
        });
      }
      // Then SIWE sign-in
      await signIn();
    } catch (e) {
      console.error('Auth error:', e);
      alert(e instanceof Error ? e.message : 'Connection failed');
    } finally {
      setSigningIn(false);
    }
  };

  const shortenAddress = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;
  const roleName = role === 0 ? 'Kuli' : role === 1 ? 'Kontraktor' : null;

  // Kuli sees all. Kontraktor doesn't see "Kirim Bukti" or "Kerjaan Saya".
  const allLinks = [
    { href: '/dashboard', key: 'projects', label: 'Proyek Saya', roles: [0, 1] },
    { href: '/dashboard/my-work', key: 'my-work', label: 'Kerjaan Saya', roles: [0] },
    { href: '/dashboard/proofs', key: 'proofs', label: 'Kirim Bukti', roles: [0] },
    { href: '/dashboard/payments', key: 'payments', label: 'Pembayaran', roles: [0, 1] },
    { href: '/dashboard/reputation', key: 'reputation', label: 'Reputasi', roles: [0, 1] },
  ];

  const navLinks = role !== null
    ? allLinks.filter(l => l.roles.includes(role))
    : allLinks;

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
        <Link href="/" className="text-2xl font-bold tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
          KuliBayar.
        </Link>

        {/* Desktop Nav */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`text-sm transition-colors duration-300 ${activeItem === link.key ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {isAuthenticated && address ? (
            <>
              {roleName && (
                <span className="hidden sm:inline text-xs px-2 py-1 rounded-full bg-[#FF4500]/20 text-[#FF4500] font-medium">
                  {roleName}
                </span>
              )}
              <span className="hidden sm:inline text-sm text-gray-400 font-mono">{shortenAddress(address)}</span>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm font-medium bg-[#FF4500] text-white hover:scale-105 hover:bg-[#e63e00] transition-all duration-300"
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={connectAndSignIn}
              disabled={signingIn || isLoading}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm font-medium bg-[#FF4500] text-white hover:scale-105 hover:bg-[#e63e00] transition-all duration-300 disabled:opacity-50"
            >
              {signingIn ? 'Signing...' : 'Connect'}
            </button>
          )}

          {/* Mobile Hamburger */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isAuthenticated && (
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-80' : 'max-h-0'}`}>
          <div className="container mx-auto px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-3 px-4 rounded-xl text-sm transition-colors duration-300 ${
                  activeItem === link.key
                    ? 'text-white bg-white/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
