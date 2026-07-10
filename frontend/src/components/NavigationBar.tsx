'use client';

import { useState, useEffect } from 'react';

export default function NavigationBar({ activeItem = 'dashboard' }: { activeItem?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) setAccount(accounts[0]);
    });
    const handleAccounts = (accounts: string[]) => {
      setAccount(accounts.length > 0 ? accounts[0] : null);
    };
    const handleChain = () => window.location.reload();
    window.ethereum.on('accountsChanged', handleAccounts);
    window.ethereum.on('chainChanged', handleChain);
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccounts);
      window.ethereum?.removeListener('chainChanged', handleChain);
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
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
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const navLinks = [
    { href: '/dashboard', key: 'projects', label: 'Proyek Saya' },
    { href: '/dashboard/my-work', key: 'my-work', label: 'Kerjaan Saya' },
    { href: '/dashboard/proofs', key: 'proofs', label: 'Kirim Bukti' },
    { href: '/dashboard/payments', key: 'payments', label: 'Pembayaran' },
    { href: '/dashboard/reputation', key: 'reputation', label: 'Reputasi' },
  ];

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

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className={`text-sm transition-colors duration-300 ${activeItem === link.key ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Wallet */}
          {account ? (
            <>
              <span className="hidden sm:inline text-sm text-gray-400 font-mono">{shortenAddress(account)}</span>
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm font-medium bg-[#FF4500] text-white hover:scale-105 hover:bg-[#e63e00] transition-all duration-300"
              >
                Dashboard
              </a>
            </>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm font-medium bg-[#FF4500] text-white hover:scale-105 hover:bg-[#e63e00] transition-all duration-300 disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-80' : 'max-h-0'}`}>
        <div className="container mx-auto px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
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
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
