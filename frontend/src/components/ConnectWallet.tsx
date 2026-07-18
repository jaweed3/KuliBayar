'use client';

import { useState, useEffect } from 'react';

export default function ConnectWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) setAccount(accounts[0]);
    });

    // Listen for account changes
    const handleAccounts = (accounts: string[]) => {
      setAccount(accounts.length > 0 ? accounts[0] : null);
    };

    // Listen for chain changes (reload on chain switch)
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
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);

      // Switch to Polygon Amoy
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13882' }],
        });
      } catch {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x13882',
            chainName: 'Polygon Amoy Testnet',
            nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
            rpcUrls: ['https://rpc-amoy.polygon.technology'],
            blockExplorerUrls: ['https://amoy.polygonscan.com'],
          }],
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{shortenAddress(account)}</span>
        <button
          onClick={() => setAccount(null)}
          className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
